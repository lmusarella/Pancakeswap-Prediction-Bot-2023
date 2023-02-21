const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, COPY_TRADING_STRATEGY } = require("../common/constants/bot.constants");
const { betDownStrategy, betUpStrategy } = require("./bet-strategy.module");

const COPY_TRADING_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY;

const executeBetDownCopyTradingStrategy = async (epoch, betRoundEvent) => {
    betRoundEvent.betExecuted = await betDownStrategy(epoch);
    betRoundEvent.message = `🔮 Friend ${COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE} bet to DOWN 🔴`;
    betRoundEvent.bet = BET_DOWN;
    return betRoundEvent;
}

const executeBetUpCopyTradingStrategy = async (epoch, betRoundEvent) => {
    betRoundEvent.betExecuted = await betUpStrategy(epoch);
    betRoundEvent.message = `🔮 Friend ${COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE} bet to UP 🟢`;
    betRoundEvent.bet = BET_UP;
    return betRoundEvent;
}

const isCopyTradingStrategy = () => {
    return GLOBAL_CONFIG.SELECTED_STRATEGY == COPY_TRADING_STRATEGY;
};

module.exports = {
    executeBetDownCopyTradingStrategy,
    executeBetUpCopyTradingStrategy,
    isCopyTradingStrategy
};