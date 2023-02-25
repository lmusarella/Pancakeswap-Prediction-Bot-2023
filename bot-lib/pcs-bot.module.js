/**
 * @Module 
 * @author luca.musarella
 */
const { GLOBAL_CONFIG } = require("../bot-configuration/bot-configuration");
const { BET_UP, CRYPTO_DECIMAL, BNB_CRYPTO, CAKE_CRYPTO, SIGNAL_STRATEGY, QUOTE_STRATEGY, COPY_TRADING_STRATEGY } = require("./common/constants/bot.constants");
const { fixedFloatNumber, parseFromUsdToCrypto, setCryptoUsdPrice, formatUnit, getCrypto, setCryptoFeeUsdPrice } = require('./common/utils.module');
const { getRoundData, getMinBetAmount, getCurrentEpoch, setSmartContratConfig, isClaimableRound, claimRewards } = require('./smart-contracts/pcs-prediction-smart-contract.module');
const { getStatisticFromHistory } = require('./history/history.module');
const { getSimulationBalance, updateSimulationBalance, getBNBBalance } = require('./wallet/wallet.module');
const { getBinancePrice } = require('./external-data/binance.module');
const { printWelcomeMessage, printGlobalSettings, printWalletInfo, printSectionSeparator, printStopBotMessage, printInitBotMessage, printStartBotMessage } = require('./common/print.module');
const { executeStrategyWithSignals, isSignalStrategy } = require('./strategies/signals-strategy.module');
const { isQuoteStrategy, executeStrategyWithQuotes } = require('./strategies/quote-strategy.module');
const { executeBetUpCopyTradingStrategy, executeBetDownCopyTradingStrategy } = require('./strategies/copytrading-strategy.module');
const { BINANCE_API_BNB_USDT_URL, BINANCE_API_CAKE_USDT_URL } = require("./common/constants/api.constants");
 
const BET_CONFIG = GLOBAL_CONFIG.BET_CONFIGURATION;
const STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION;

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

const checkGlobalConfiguration = () => {
  const validCryptoGames = [BNB_CRYPTO, CAKE_CRYPTO];
  const validBotStrategies = [SIGNAL_STRATEGY, QUOTE_STRATEGY, COPY_TRADING_STRATEGY];
  if (!validCryptoGames.includes(GLOBAL_CONFIG.PCS_CRYPTO_SELECTED)) {
    console.log(`🚨 Select a valid game in [bot-configuration.js][PCS_CRYPTO_SELECTED] =>`, validCryptoGames);
    printSectionSeparator();
    stopBotCommand();
  }
  if (!validBotStrategies.includes(GLOBAL_CONFIG.SELECTED_STRATEGY)) {
    console.log(`🚨 Select a valid strategy [bot-configuration.js][SELECTED_STRATEGY] =>`, validBotStrategies);
    printSectionSeparator();
    stopBotCommand();
  }
}

const startBotCommand = async () => {
  printInitBotMessage();
  checkGlobalConfiguration();
  const currentEpoch = await initializeBotSettings();
  printWelcomeMessage();
  printGlobalSettings();
  const actualUsdProfit = await getActualUsdProfit();
  if (actualUsdProfit) {
    updateSimulationBalance(GLOBAL_CONFIG.SIMULATION_BALANCE + actualUsdProfit);
  }
  const balance = await getPersonalBalance();
  printWalletInfo(balance);
  printStartBotMessage(currentEpoch);
}

const stopBotCommand = () => {
  printStopBotMessage();
  process.exit();
}

const executeBetStrategy = async (epoch) => {
  const betRoundEvent = createBetRoundEvent(epoch);
  if (isSignalStrategy()) {
    return await executeStrategyWithSignals(epoch, betRoundEvent);
  } else if (isQuoteStrategy()) {
    return await executeStrategyWithQuotes(epoch, betRoundEvent);
  } else {
    betRoundEvent.skipRound = true;
    betRoundEvent.message = "Strategy not execute!"
    return betRoundEvent;
  }
}

const executeBetUpStrategy = async (epoch) => {
  return await executeBetUpCopyTradingStrategy(epoch, createBetRoundEvent(epoch));
}

const executeBetDownStrategy = async (epoch) => {
  return await executeBetDownCopyTradingStrategy(epoch, createBetRoundEvent(epoch));;
}

const createBetRoundEvent = (epoch) => {
  return { id: formatUnit(epoch), betAmount: BET_CONFIG.BET_AMOUNT, skipRound: false, betExecuted: false, bet: null, message: null };
}

const checkStopLossAndTargetProfitReached = (actualUsdProfit) => {
  return (actualUsdProfit >= BET_CONFIG.DAILY_GOAL) || (actualUsdProfit + BET_CONFIG.STOP_LOSS <= 0);
}

const checkBalanceNotEnough = async (cryptoBalanceToCheck) => {
  const betAmount = parseFromUsdToCrypto(BET_CONFIG.BET_AMOUNT);
  const minBetAmount = await getMinBetAmount();
  return (cryptoBalanceToCheck < betAmount) || (betAmount < minBetAmount) || (!STRATEGY_CONFIG.SIMULATION_MODE && cryptoBalanceToCheck < minBetAmount);
}

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
  if (checkStopLossAndTargetProfitReached(actualUsdProfit)) {
    startRoundEvent.validProfit = false;
    startRoundEvent.stopBot = !existPendingRound;
    startRoundEvent.skipRound = existPendingRound;
    startRoundEvent.errors.push(`Stop Loss or Daily Goal reached!`);
  }
  if (await checkBalanceNotEnough(actualCryptoBalance)) {
    startRoundEvent.validBalance = false;
    startRoundEvent.stopBot = !existPendingRound;
    startRoundEvent.skipRound = existPendingRound;
    startRoundEvent.errors.push(`Your balance is not enough! Check your BET_AMOUNT and SmartContract MinBetAmount!`);
  }
  return startRoundEvent;
};

const getActualUsdProfit = async () => {
  const statisticHistoryData = await getStatisticFromHistory();
  return statisticHistoryData ? (statisticHistoryData.profit_usd - statisticHistoryData.totalTxGasFeeUsd) : 0;
}

const getPersonalBalance = async () => {
  if (GLOBAL_CONFIG.SIMULATION_MODE) {
    return parseFromUsdToCrypto(getSimulationBalance());
  }
  const balance = getCrypto() === BNB_CRYPTO ? await getBNBBalance() : await getCakeBalance();
  return fixedFloatNumber(balance, CRYPTO_DECIMAL);
}

const createEndRoundEvent = async (roundHistory, epoch) => {
  const lastRoundIndex = roundHistory.findIndex(round => round.round === formatUnit(epoch));
  const lastRound = roundHistory[lastRoundIndex];
  const roundWon = lastRound.bet === lastRound.winner && lastRound.betExecuted;
  const betTransactionError = lastRound.bet && !lastRound.betExecuted;
  const isClaimable = GLOBAL_CONFIG.CLAIM_REWARDS && roundWon && await isClaimableRound(epoch);
  const bullPayout = lastRound.bullPayout;
  const bearPayout = lastRound.bearPayout;
  const percentageProfit = roundWon && lastRound.bet == BET_UP ? ((bullPayout - 1) * 100) : ((bearPayout - 1) * 100);
  const betAmount = lastRound.betAmount;
  const betTxGasFee = lastRound.txGasFee;
  const claimTransaction = isClaimable ? await claimRewards([epoch]) : { status: 0, txGasFee: 0};
  const txClaimGasFee = (GLOBAL_CONFIG.SIMULATION_MODE && roundWon) ? betTxGasFee : claimTransaction.txGasFee;
  const roundEarning = roundWon && lastRound.bet == BET_UP ? (betAmount * bullPayout - betAmount) : (betAmount * bearPayout - betAmount);
  lastRound.txClaimGasFee = txClaimGasFee;
  return {
    id: formatUnit(epoch),
    roundWon: roundWon,
    betTransactionError: betTransactionError,
    isClaimable: isClaimable,
    claimExecuted: claimTransaction.transactionExeption ? null : claimTransaction.status === 1,
    roundProfit: roundWon ? roundEarning : -betAmount,
    percentageProfit: roundWon ? percentageProfit : -100,
    betTxGasFee: betTxGasFee,
    txClaimGasFee: txClaimGasFee
  };
}

module.exports = {
  stopBotCommand,
  startBotCommand,
  executeBetStrategy,
  executeBetUpStrategy,
  executeBetDownStrategy,
  createStartRoundEvent,
  createBetRoundEvent,
  createEndRoundEvent
};