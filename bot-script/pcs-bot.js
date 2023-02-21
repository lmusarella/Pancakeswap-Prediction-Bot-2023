
const { GLOBAL_CONFIG } = require("../bot-configuration/bot-configuration");
const { EVENTS } = require("../bot-lib/common/constants/smart-contract.constants");
const { saveRoundInHistory, saveStatisticsInHistory } = require('../bot-lib/history/history.module');
const { getSmartContract, getRoundData } = require('../bot-lib/smart-contracts/pcs-prediction-smart-contract.module');
const { stopBotCommand, startBotCommand, executeBetStrategy, createStartRoundEvent, createEndRoundEvent, executeBetUpStrategy, executeBetDownStrategy} = require('../bot-lib/pcs-bot.module');
const { formatEther, getCrypto, updateCryptoUsdPriceFromSmartContract, formatUnit } = require('../bot-lib/common/utils.module');
const { updateSimulationBalance } = require("../bot-lib/wallet/wallet.module");
const { printStartRoundEvent, printBetRoundEvent, printEndRoundEvent, printStatistics, printSectionSeparator } = require("../bot-lib/common/print.module");
const { isCopyTradingStrategy } = require("../bot-lib/strategy/copytrading-strategy.module");
const sleep = require("util").promisify(setTimeout);

//Global Configurations
const COPY_TRADING_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY;

//Pending round
const pendingRoundEventStack = new Map();

const init = async () => {
  await startBotCommand();
} 

init();

  //Listener on "StartRound" event from {@PredictionGameSmartContract}
  getSmartContract().on(EVENTS.START_ROUND_EVENT, async (epoch) => {
    const startRoundEvent = await createStartRoundEvent(epoch, pendingRoundEventStack.size);
    printStartRoundEvent(startRoundEvent, pendingRoundEventStack);
    if(startRoundEvent.stopBot) {
      stopBotCommand();
    }
    if(!startRoundEvent.skipRound) {
      pendingRoundEventStack.set(startRoundEvent.id, startRoundEvent);
      if(!isCopyTradingStrategy()) {       
        await sleep(GLOBAL_CONFIG.WAITING_TIME);
        const betRoundEvent = await executeBetStrategy(epoch)
        printBetRoundEvent(betRoundEvent);
        if(betRoundEvent.skipRound) {
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
    const roundEvent = pendingRoundEventStack.get(formatUnit(epoch));
    if(roundEvent && roundEvent.bet) {
      const roundsHistoryData = await saveRoundInHistory(await getRoundData(epoch));
      const endRoundEvent = await createEndRoundEvent(roundsHistoryData, epoch);
      const statistics = saveStatisticsInHistory(roundsHistoryData);
      pendingRoundEventStack.delete(endRoundEvent.id);
      printEndRoundEvent(endRoundEvent);
      printStatistics(statistics, pendingRoundEventStack);
      if(GLOBAL_CONFIG.SIMULATION_MODE) {
        updateSimulationBalance(GLOBAL_CONFIG.SIMULATION_BALANCE + statistics.profit_crypto);
      }
    }
  });


  //Listener on "BetBear" event from {@PredictionGameSmartContract}
  getSmartContract().on(EVENTS.BET_BEAR_EVENT,async (sender, epoch) => {
      if(isCopyTradingStrategy() && pendingRoundEventStack.get(formatUnit(epoch)) && sender == COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE){  
          const betRoundEvent = await executeBetDownStrategy(epoch);                  
          printBetRoundEvent(betRoundEvent);
          pendingRoundEventStack.set(betRoundEvent.id, betRoundEvent);
      }
  });

  //Listener on "BetBull" event from {@PredictionGameSmartContract}
  getSmartContract().on(EVENTS.BET_BULL_EVENT, async(sender, epoch) =>{       
      if(isCopyTradingStrategy() && pendingRoundEventStack.get(formatUnit(epoch)) && sender == COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE){ 
          const betRoundEvent = await executeBetUpStrategy(epoch);     
          printBetRoundEvent(betRoundEvent);
          pendingRoundEventStack.set(betRoundEvent.id, betRoundEvent);
      }
  });

   //Listener on "LockRound" event from {@PredictionGameSmartContract}
   getSmartContract().on(EVENTS.LOCK_ROUND, async(epoch) =>{   
      if(isCopyTradingStrategy()) {
        const roundEvent = pendingRoundEventStack.get(formatUnit(epoch));
        if(roundEvent && !roundEvent.bet) {
          console.log(`🥺 Sorry your friend ${COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE} didn't bet this round!`, formatUnit(epoch));
          printSectionSeparator();
        }
      }
  });

  //Listener on "Claim" event from {@PredictionGameSmartContract}
  getSmartContract().on(EVENTS.CLAIM_EVENT, async(sender, _epoch, addedRewards) =>{   
    if(sender == process.env.PERSONAL_WALLET_ADDRESS){ 
      console.log(`🗿 Successful collect ${formatEther(addedRewards)} ${getCrypto()}`);
      printSectionSeparator();
    }
  });
