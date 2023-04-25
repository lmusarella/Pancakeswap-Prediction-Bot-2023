/**
 * Module that exposes the useful functions for the management of the signals strategy
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require("ethers");
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, SIGNAL_STRATEGY } = require("../common/constants/bot.constants");
const { percentage, getCrypto } = require("../common/utils.module");
const { getTradingSignals } = require("../external-data/trading-signals.module");
const { betDownStrategy, betUpStrategy } = require("./bet-strategy.module");
const SIGNALS_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.SIGNAL_STRATEGY;

/**
 * Retrieve signals from TradingView library and predict the signals, according to signals strategy configuration execute the BetStrategy
 * @date 4/25/2023 - 6:35:23 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @param {any} betRoundEvent - Bet Round Event object
 * @returns {any} - Bet Round Event object
 */
const executeStrategyWithSignals = async (epoch, betRoundEvent) => {
    const signals = await getTradingSignals(getCrypto());
    if (!signals) {
        betRoundEvent.skipRound = true;
        betRoundEvent.message = `Error Obtain signals from TradingViewScan`;
        return betRoundEvent;
    }
    if (checkSignalsUpPrediction(signals)) {
        betRoundEvent.bet = GLOBAL_CONFIG.REVERSE_BETTING ? BET_DOWN : BET_UP;
        betRoundEvent.message = `🔮 Signal Prediction: UP 🟢 ${percentage(signals.buy, signals.sell)}%`;
        betRoundEvent.betExecuted = GLOBAL_CONFIG.REVERSE_BETTING ? await betDownStrategy(epoch) : await betUpStrategy(epoch);
    } else if (checkSignalsDownPrediction(signals)) {
        betRoundEvent.bet = GLOBAL_CONFIG.REVERSE_BETTING ? BET_UP : BET_DOWN;
        betRoundEvent.message = `🔮 Signal Prediction: DOWN 🔴 ${percentage(signals.sell, signals.buy)}%`;
        betRoundEvent.betExecuted = GLOBAL_CONFIG.REVERSE_BETTING ? await betUpStrategy(epoch): await betDownStrategy(epoch);
    } else {
        betRoundEvent.skipRound = true;
        betRoundEvent.message = `Threshold not reached ${(signals.buy > signals.sell ? percentage(signals.buy, signals.sell) : percentage(signals.sell, signals.buy))} %`;
    }
    return betRoundEvent;
};

/**
 * Check if the strategy selected is SIGNAL_STRATEGY
 * @date 4/25/2023 - 6:35:23 PM
 *
 * @returns {boolean}
 */
const isSignalStrategy = () => {
    return GLOBAL_CONFIG.SELECTED_STRATEGY == SIGNAL_STRATEGY;
};

/**
 * Check Signal UP condition and if the minimum THRESHOLD are reached
 * @date 4/25/2023 - 6:35:23 PM
 *
 * @param {{buy: Number, sell: Number, neutral: Number}} signals
 * @returns {boolean}
 */
const checkSignalsUpPrediction = (signals) => {
    return signals.buy > signals.sell && percentage(signals.buy, signals.sell) > SIGNALS_STRATEGY_CONFIG.THRESHOLD;
}

/**
 * Check Signal DOWN condition and if the minimum THRESHOLD are reached
 * @date 4/25/2023 - 6:35:23 PM
 *
 * @param {{buy: Number, sell: Number, neutral: Number}} signals
 * @returns {boolean}
 */
const checkSignalsDownPrediction = (signals) => {
    return signals.sell > signals.buy && percentage(signals.sell, signals.buy) > SIGNALS_STRATEGY_CONFIG.THRESHOLD;
}

module.exports = {
    executeStrategyWithSignals,
    isSignalStrategy
};