/**
 * Central module that defines the functions and commands useful to the BOT, defines the initialization and shutdown commands of the bot. It defines the business logic and orchestrates the other modules.
 * @Module 
 * @author luca.musarella
 */
const { GLOBAL_CONFIG } = require("../bot-configuration/bot-configuration");
const { BET_UP, CRYPTO_DECIMAL, BNB_CRYPTO, CAKE_CRYPTO, SIGNAL_STRATEGY, QUOTE_STRATEGY, COPY_TRADING_STRATEGY, PATTERN_STRATEGY } = require("./common/constants/bot.constants");
const { fixedFloatNumber, parseFromUsdToCrypto, setCryptoUsdPrice, formatUnit, getCrypto, setCryptoFeeUsdPrice, setBetAmount, getBetAmount } = require('./common/utils.module');
const { getRoundData, getMinBetAmount, getCurrentEpoch, setSmartContratConfig } = require('./smart-contracts/pcs-prediction-smart-contract.module');
const { getStatisticFromHistory, saveRoundInHistory, ALL_ROUND_HISTORY_FILENAME, backUpFilesHistory, resetFilesHistory} = require('./history/history.module');
const { getSimulationBalance, updateSimulationBalance, getBNBBalance } = require('./wallet/wallet.module');
const { getBinancePrice } = require('./external-data/binance.module');
const { printWelcomeMessage, printGlobalSettings, printWalletInfo, printSectionSeparator, printStopBotMessage, printInitBotMessage, printStartBotMessage, printCurrencyInfo, printCallToAction } = require('./common/print.module');
const { executeStrategyWithSignals, isSignalStrategy } = require('./strategies/signals-strategy.module');
const { isQuoteStrategy, executeStrategyWithQuotes } = require('./strategies/quote-strategy.module');
const { executeBetUpCopyTradingStrategy, executeBetDownCopyTradingStrategy } = require('./strategies/copytrading-strategy.module');
const { BINANCE_API_BNB_USDT_URL, BINANCE_API_CAKE_USDT_URL } = require("./common/constants/api.constants");
const { claimStrategy } = require("./strategies/bet-strategy.module");
const { getCakeBalance } = require("./smart-contracts/cake-token-smart-contract.module");
const { ethers } = require("ethers");
const { CONSOLE_STRINGS } = require("./common/constants/strings.constants");
const { isPatternStrategy, executeStrategyWithPatterns } = require("./strategies/pattern-strategy.module");


/**
 * Function called when the bot starts, initializes the smart contract and prints the bot's launch co-configuration. Retrieve the data of the next useful round and start the bot
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @returns {number} - Current live round
 */
const initializeBotSettings = async () => {
  setSmartContratConfig(GLOBAL_CONFIG.PCS_CRYPTO_SELECTED);
  const currentEpoch = await getCurrentEpoch();
  const lastRoundData = await getRoundData(currentEpoch - 1);
  const binanceFeeUsdPrice = await getBinancePrice(BINANCE_API_BNB_USDT_URL);
  setCryptoFeeUsdPrice(binanceFeeUsdPrice);
  if (!lastRoundData.openPrice) {
    const crypto_api_url = getCrypto() === BNB_CRYPTO ? BINANCE_API_BNB_USDT_URL : BINANCE_API_CAKE_USDT_URL;
    const binanceUsdPrice = await getBinancePrice(crypto_api_url);
    setCryptoUsdPrice(binanceUsdPrice);
  } else {
    setCryptoUsdPrice(lastRoundData.openPrice);
  }
  return currentEpoch;
}

/**
 * Check that the configuration data has been entered correctly
 * @date 4/25/2023 - 4:34:23 PM
 */
const checkGlobalConfiguration = () => {
  const validCryptoGames = [BNB_CRYPTO, CAKE_CRYPTO];
  const validBotStrategies = [SIGNAL_STRATEGY, QUOTE_STRATEGY, COPY_TRADING_STRATEGY, PATTERN_STRATEGY];
  if (!validCryptoGames.includes(GLOBAL_CONFIG.PCS_CRYPTO_SELECTED)) {
    console.log(CONSOLE_STRINGS.ERROR_MESSAGE.CONFIG_VALID_GAME, validCryptoGames);
    printSectionSeparator();
    stopBotCommand();
  }
  if (!validBotStrategies.includes(GLOBAL_CONFIG.STRATEGY_CONFIGURATION.SELECTED_STRATEGY)) {
    console.log(CONSOLE_STRINGS.ERROR_MESSAGE.CONFIG_VALID_STRATEGY, validBotStrategies);
    printSectionSeparator();
    stopBotCommand();
  }
}

/**
 * Bot start command
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 */
const startBotCommand = async () => {
  printInitBotMessage();
  checkGlobalConfiguration();
  const currentEpoch = await initializeBotSettings();

  if(GLOBAL_CONFIG.ANALYTICS_CONFIGURATION.RESET_AND_BACKUP_BOT_HISTORY) {
    await backUpFilesHistory();
    resetFilesHistory();
  }

  printWelcomeMessage();
  printCurrencyInfo();
  printGlobalSettings();
  const actualUsdProfit = await getActualUsdProfit();
  if (actualUsdProfit) {
    updateSimulationBalance(GLOBAL_CONFIG.SIMULATION_CONFIGURATION.SIMULATION_BALANCE + actualUsdProfit);
  }
  const balance = await getPersonalBalance();
  printWalletInfo(balance);
  printCallToAction();
  printStartBotMessage(currentEpoch);
}

/**
 * Bot stop command
 * @date 4/25/2023 - 4:34:23 PM
 */
const stopBotCommand = () => {
  printStopBotMessage();
  process.exit();
}

/**
 * Bot execute strategy command
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @returns {any} - bet round event object
 */
const executeBetStrategy = async (epoch) => {
  const betRoundEvent = createBetRoundEvent(epoch);
  if (isSignalStrategy()) {
    return await executeStrategyWithSignals(epoch, betRoundEvent);
  } else if (isQuoteStrategy()) {
    return await executeStrategyWithQuotes(epoch, betRoundEvent);
  } else if(isPatternStrategy()) {
    return await executeStrategyWithPatterns(epoch, betRoundEvent);
  } else {
    betRoundEvent.skipRound = true;
    betRoundEvent.message = CONSOLE_STRINGS.WARNING_MESSAGE.STRATEGY_NOT_EXECUTE;
    return betRoundEvent;
  }
}

/**
 * Bot bet up execute strategy command
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @returns {any} - bet round event object
 */
const executeBetUpStrategy = async (epoch) => {
  return await executeBetUpCopyTradingStrategy(epoch, createBetRoundEvent(epoch));
}

/**
 * Bot bet up execute strategy command
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @returns {any} - bet round event object
 */
const executeBetDownStrategy = async (epoch) => {
  return await executeBetDownCopyTradingStrategy(epoch, createBetRoundEvent(epoch));
}

/**
 * Create bet round event default object
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @param {ethers.BigNumber} epoch - round
 * @returns {{ id: number; betAmount: number; skipRound: boolean; betExecuted: boolean; bet: string; message: string; }}
 */
const createBetRoundEvent = (epoch) => {
  return { id: formatUnit(epoch), betAmount: getBetAmount(), skipRound: false, betExecuted: false, bet: null, message: null };
}

/**
 * Check if is reached the DAILY_GOAL or STOP_LOSS
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @param {number} actualUsdProfit
 * @returns {boolean}
 */
const checkStopLossAndTargetProfitReached = (actualUsdProfit) => {
  return (actualUsdProfit >= GLOBAL_CONFIG.BET_CONFIGURATION.DAILY_GOAL) || (actualUsdProfit + GLOBAL_CONFIG.BET_CONFIGURATION.STOP_LOSS <= 0);
}

/**
 * Check if balance is enough
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @param {number} cryptoBalanceToCheck
 * @returns {boolean}
 */
const checkBalanceNotEnough = async (cryptoBalanceToCheck) => {
  const betAmount = parseFromUsdToCrypto(getBetAmount());
  const minBetAmount = await getMinBetAmount();
  return (cryptoBalanceToCheck < betAmount) || (betAmount < minBetAmount) || (!GLOBAL_CONFIG.SIMULATION_MODE && cryptoBalanceToCheck < minBetAmount);
}

/**
 * Create the start event request object and check the condition if the are all the conditions to continue to run the bot, or skip the round.
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @param {number} existPendingRound
 * @returns {any} - start round event object
 */
const createStartRoundEvent = async (epoch, existPendingRound) => {
  const actualUsdProfit = await getActualUsdProfit();
  const actualCryptoBalance = await getPersonalBalance();
  const startRoundEvent = {
    id: formatUnit(epoch),
    actualBalance: actualCryptoBalance,
    actualProfit: actualUsdProfit,
    validBalance: true,
    validProfit: true,
    stopBot: false,
    skipRound: false,
    errors: []
  }

  if(GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.ACTIVE) {
    startRoundEvent.skipRound = existPendingRound;
  }

  if (checkStopLossAndTargetProfitReached(actualUsdProfit)) {
    startRoundEvent.validProfit = false;
    startRoundEvent.stopBot = !existPendingRound;
    startRoundEvent.skipRound = existPendingRound;
    startRoundEvent.errors.push(CONSOLE_STRINGS.ERROR_MESSAGE.STOP_LOSS_GOAL);
  }
  if (await checkBalanceNotEnough(actualCryptoBalance)) {
    startRoundEvent.validBalance = false;
    startRoundEvent.stopBot = !existPendingRound;
    startRoundEvent.skipRound = existPendingRound;
    startRoundEvent.errors.push(CONSOLE_STRINGS.ERROR_MESSAGE.BALANCE_NOT_ENOUGH);
  }
  return startRoundEvent;
};

/**
 * Return the current profit
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @returns {number}
 */
const getActualUsdProfit = async () => {
  const statisticHistoryData = await getStatisticFromHistory();
  return statisticHistoryData ? (statisticHistoryData.profit_usd - statisticHistoryData.totalTxGasFeeUsd) : 0;
}

/**
 * Return the personal balance of the wallet
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @returns {number}
 */
const getPersonalBalance = async () => {
  if (GLOBAL_CONFIG.SIMULATION_MODE) {
    return parseFromUsdToCrypto(getSimulationBalance());
  }
  const balance = getCrypto() === BNB_CRYPTO ? await getBNBBalance() : await getCakeBalance();
  return fixedFloatNumber(balance, CRYPTO_DECIMAL);
}

/**
 * Retrive the last data of history and merge with the round data from smart contract on END round event
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @param {any} betEvent - betEvent data
 * @returns {any} - last round data from history
 */
const getEndRoundData = async (epoch, betEvent) => {
  const endRoundData = await getRoundData(epoch);
  endRoundData.bet = betEvent.bet;
  endRoundData.betAmount = betEvent.betAmount;
  endRoundData.betExecuted = betEvent.betExecuted;
  endRoundData.txGasFee = betEvent.txGasFee;
  return endRoundData;
}

/**
 * Create the end round event object and calculate the result, the profit, the fee cost, try to claim rewards
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @param {any} lastRound - last round complete data
 * @param {ethers.BigNumber} epoch - current round
 * @returns {and} - end round event object
 */
const createEndRoundEvent = async (lastRound, epoch) => {
  const roundWon = lastRound.bet === lastRound.winner;

  if(GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.ACTIVE) {
    if((roundWon && lastRound.betExecuted && GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.ANTI_MARTINGALE) || (!roundWon && lastRound.betExecuted && !GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.ANTI_MARTINGALE)) {
        setBetAmount(GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.INCREMENT_BET_AMOUNT * getBetAmount())
    } else {
        setBetAmount(GLOBAL_CONFIG.BET_CONFIGURATION.BET_AMOUNT);
    }
  }
  const betTransactionError = lastRound.bet && !lastRound.betExecuted;
  const claimTransaction = await claimStrategy(epoch);
  lastRound.txClaimGasFee = (GLOBAL_CONFIG.SIMULATION_MODE && roundWon && lastRound.betExecuted) ? lastRound.txGasFee : claimTransaction.txGasFee;
  const percentageProfit = lastRound.bet == BET_UP ? ((lastRound.bullPayout - 1) * 100) : ((lastRound.bearPayout - 1) * 100);
  const roundEarning = lastRound.bet == BET_UP ? (lastRound.betAmount * lastRound.bullPayout - lastRound.betAmount) : (lastRound.betAmount * lastRound.bearPayout - lastRound.betAmount);
  return {
    id: formatUnit(epoch),
    roundWon: roundWon && lastRound.betExecuted,
    betTransactionError: betTransactionError,
    claimExecuted: claimTransaction.transactionExeption ? null : claimTransaction.status === 1,
    roundProfit: roundWon && lastRound.betExecuted ? roundEarning : !lastRound.betExecuted ? 0 : -lastRound.betAmount,
    percentageProfit: roundWon && lastRound.betExecuted? percentageProfit : !lastRound.betExecuted ? 0 : -100,
    betTxGasFee: lastRound.txGasFee,
    txClaimGasFee: lastRound.txClaimGasFee
  };
}

/**
 * Save round data
 * @date 4/25/2023 - 4:34:23 PM
 *
 * @async
 * @param {Number} round - current round
 */
const handleRoundResult = async (round) => {
    const roundData = await getRoundData(round);
    return await saveRoundInHistory([roundData], ALL_ROUND_HISTORY_FILENAME);
}

module.exports = {
  stopBotCommand,
  startBotCommand,
  getEndRoundData,
  executeBetStrategy,
  executeBetUpStrategy,
  executeBetDownStrategy,
  createStartRoundEvent,
  createBetRoundEvent,
  createEndRoundEvent,
  handleRoundResult
};
