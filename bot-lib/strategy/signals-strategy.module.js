const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, SIGNAL_STRATEGY } = require("../common/constants/bot.constants");
const { percentage, getCrypto } = require("../common/utils.module");
const { getTradingSignals } = require("../external-data/trading-signals.module");
const { betDownStrategy, betUpStrategy } = require("./bet-strategy.module");

const SIGNALS_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.SIGNAL_STRATEGY;

const executeStrategyWithSignals = async (epoch, betRoundEvent) => {
    const signals = await getTradingSignals(getCrypto());
    if(!signals) {
      betRoundEvent.skipRound = true;
      betRoundEvent.message = `Error Obtain signals from TradingViewScan`;
      return betRoundEvent;
    }
    if (checkSignalsUpPrediction(signals)) {
        betRoundEvent.bet = BET_UP;
        betRoundEvent.message = `🔮 Signal Prediction: UP 🟢 ${percentage(signals.buy, signals.sell)}%`; 
        betRoundEvent.betExecuted = await betUpStrategy(epoch);  
    } else if (checkSignalsDownPrediction(signals)) {
        betRoundEvent.bet = BET_DOWN;
        betRoundEvent.message = `🔮 Signal Prediction: DOWN 🔴 ${percentage(signals.sell, signals.buy)}%`;
        betRoundEvent.betExecuted = await betDownStrategy(epoch);    
    } else {
      betRoundEvent.skipRound = true;
      betRoundEvent.message = `Threshold not reached ${(signals.buy > signals.sell ? percentage(signals.buy, signals.sell) : percentage(signals.sell, signals.buy))} %`;
    }
    return betRoundEvent;
};

const isSignalStrategy = () => {
    return GLOBAL_CONFIG.SELECTED_STRATEGY == SIGNAL_STRATEGY;
  };

const checkSignalsUpPrediction = (signals) => {
    return signals.buy > signals.sell && percentage(signals.buy, signals.sell) > SIGNALS_STRATEGY_CONFIG.THRESHOLD;
}

const checkSignalsDownPrediction = (signals) => {
    return signals.sell > signals.buy && percentage(signals.sell, signals.buy) > SIGNALS_STRATEGY_CONFIG.THRESHOLD;
}

module.exports = {
    executeStrategyWithSignals,
    isSignalStrategy
};