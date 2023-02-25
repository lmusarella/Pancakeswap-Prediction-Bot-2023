
/**
 * @script 
 * @author luca.musarella
 */
const { GLOBAL_CONFIG } = require("../bot-configuration/bot-configuration");
const { EVENTS } = require("../bot-lib/common/constants/smart-contract.constants");
const { saveRoundInHistory, saveStatisticsInHistory } = require('../bot-lib/history/history.module');
const { getSmartContract } = require('../bot-lib/smart-contracts/pcs-prediction-smart-contract.module');
const { stopBotCommand, startBotCommand, executeBetStrategy, createStartRoundEvent, createEndRoundEvent, executeBetUpStrategy, executeBetDownStrategy, getEndRoundData } = require('../bot-lib/pcs-bot.module');
const { formatEther, getCrypto, updateCryptoUsdPriceFromSmartContract, formatUnit, parseFromCryptoToUsd, fixedFloatNumber, setCryptoFeeUsdPrice } = require('../bot-lib/common/utils.module');
const { updateSimulationBalance } = require("../bot-lib/wallet/wallet.module");
const { printStartRoundEvent, printBetRoundEvent, printEndRoundEvent, printStatistics, printSectionSeparator } = require("../bot-lib/common/print.module");
const { isCopyTradingStrategy, registerUser, handleUsersActivity, getMostActiveUser } = require("../bot-lib/strategies/copytrading-strategy.module");
const { CRYPTO_DECIMAL, USD_DECIMAL, START_ROUND_WAITING_TIME, BET_DOWN, BET_UP } = require("../bot-lib/common/constants/bot.constants");
const { getBinancePrice } = require("../bot-lib/external-data/binance.module");
const { BINANCE_API_BNB_USDT_URL } = require("../bot-lib/common/constants/api.constants");
const sleep = require("util").promisify(setTimeout);

const COPY_TRADING_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY;

const pendingRoundEventStack = new Map();

const init = async () => {
  await startBotCommand();
}

init();

//Listener on "StartRound" event from {@PredictionGameSmartContract}
getSmartContract().on(EVENTS.START_ROUND_EVENT, async (epoch) => {
  //Wait EndRoundEvent processed
  await sleep(START_ROUND_WAITING_TIME);
  const startRoundEvent = await createStartRoundEvent(epoch, pendingRoundEventStack.size);
  printStartRoundEvent(startRoundEvent, pendingRoundEventStack);
  if (startRoundEvent.stopBot) {
    stopBotCommand();
  }
  if (!startRoundEvent.skipRound) {
    pendingRoundEventStack.set(startRoundEvent.id, startRoundEvent);
    if (!isCopyTradingStrategy()) {
      await sleep(GLOBAL_CONFIG.WAITING_TIME - START_ROUND_WAITING_TIME);
      const betRoundEvent = await executeBetStrategy(epoch)
      printBetRoundEvent(betRoundEvent);
      if (betRoundEvent.skipRound) {
        pendingRoundEventStack.delete(betRoundEvent.id);
      } else {
        pendingRoundEventStack.set(betRoundEvent.id, betRoundEvent);
      }
    }
  }
});

//Listener on "EndRound" event from {@PredictionGameSmartContract}
getSmartContract().on(EVENTS.END_ROUND_EVENT, async (epoch, _roundId, cryptoClosePrice) => {
  updateCryptoUsdPriceFromSmartContract(cryptoClosePrice);
  setCryptoFeeUsdPrice(await getBinancePrice(BINANCE_API_BNB_USDT_URL));
  const roundEvent = pendingRoundEventStack.get(formatUnit(epoch));
  if (roundEvent && roundEvent.bet) {
    const endRoundData = await getEndRoundData(epoch);
    const endRoundEvent = await createEndRoundEvent(endRoundData, epoch);
    const roundsHistoryData = await saveRoundInHistory([endRoundData]);
    const statistics = saveStatisticsInHistory(roundsHistoryData);
    pendingRoundEventStack.delete(endRoundEvent.id);
    printEndRoundEvent(endRoundEvent);
    printStatistics(statistics, pendingRoundEventStack);
    if (GLOBAL_CONFIG.SIMULATION_MODE) {
      updateSimulationBalance(GLOBAL_CONFIG.SIMULATION_BALANCE + statistics.profit_usd - statistics.totalTxGasFeeUsd);
    }
  }
});


//Listener on "BetBear" event from {@PredictionGameSmartContract}
getSmartContract().on(EVENTS.BET_BEAR_EVENT, async (sender, epoch, betAmount) => {
  const round = formatUnit(epoch);
  if (pendingRoundEventStack.get(round)) {
    registerUser(round, sender, BET_DOWN, formatUnit(betAmount, "18"));
    if (isCopyTradingStrategy() && sender == COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE) {
      const betRoundEvent = await executeBetDownStrategy(epoch);
      printBetRoundEvent(betRoundEvent);
      pendingRoundEventStack.set(betRoundEvent.id, betRoundEvent);
    }
  }
});

//Listener on "BetBull" event from {@PredictionGameSmartContract}
getSmartContract().on(EVENTS.BET_BULL_EVENT, async (sender, epoch, betAmount) => {
  const round = formatUnit(epoch);
  if (pendingRoundEventStack.get(round)) {
    registerUser(round, sender, BET_UP, formatUnit(betAmount, "18"));
    if (isCopyTradingStrategy() && sender == COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE) {
      const betRoundEvent = await executeBetUpStrategy(epoch);
      printBetRoundEvent(betRoundEvent);
      pendingRoundEventStack.set(betRoundEvent.id, betRoundEvent);
    }
  }
});

//Listener on "LockRound" event from {@PredictionGameSmartContract}
getSmartContract().on(EVENTS.LOCK_ROUND, async (epoch, _roundId, price) => {
  const round = formatUnit(epoch);
  if (pendingRoundEventStack.get(round)) {
    await handleUsersActivity(round, price);
    if (isCopyTradingStrategy()) {
      const roundEvent = pendingRoundEventStack.get(round);
      if (roundEvent && !roundEvent.bet) {
        console.log(`🥺 Round [`, round, `] Sorry your friend`, [COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE], `didn't bet!`);
        printSectionSeparator();
        await getMostActiveUser();
      }
    }
  }
});

//Listener on "Claim" event from {@PredictionGameSmartContract}
getSmartContract().on(EVENTS.CLAIM_EVENT, async (sender, epoch, addedRewards) => {
  if (sender == process.env.PERSONAL_WALLET_ADDRESS) {
    console.log(`🗿 Round [`, formatUnit(epoch), `] Successful claimed`, parseFromCryptoToUsd(parseFloat(formatEther(addedRewards), USD_DECIMAL)), 'USD =', fixedFloatNumber(parseFloat(formatEther(addedRewards)), CRYPTO_DECIMAL), getCrypto());
    printSectionSeparator();
  }
});
