const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, QUOTE_STRATEGY } = require("../common/constants/bot.constants");
const { getRoundData } = require("../smart-contracts/pcs-prediction-smart-contract.module");
const { betDownStrategy, betUpStrategy } = require("./bet-strategy.module");

const QUOTE_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.QUOTE_STRATEGY;

const executeStrategyWithQuotes = async (epoch, betRoundEvent) => {
    const roundData = await getRoundData(epoch);
    if(!roundData.validQuotes){
      betRoundEvent.skipRound = true;
      betRoundEvent.message = `Inconsistent quotas from smart contract`;
      return betRoundEvent;
    }
    betRoundEvent.bullPayout = roundData.bullPayout;
    betRoundEvent.bearPayout = roundData.bearPayout;
    betRoundEvent.message = `⬆️  BullPayout ${betRoundEvent.bullPayout}x - ⬇️  BearPayout ${betRoundEvent.bearPayout}x`;
    if(QUOTE_STRATEGY_CONFIG.SELECT_LOWER_QUOTE) {
      betRoundEvent.bet = roundData.bullPayout > roundData.bearPayout ? BET_DOWN : BET_UP;
      betRoundEvent.betExecuted = roundData.bullPayout > roundData.bearPayout ? await betDownStrategy(epoch) : await betUpStrategy(epoch);
    } else {
      betRoundEvent.bet = roundData.bullPayout > roundData.bearPayout ? BET_UP : BET_DOWN;
      betRoundEvent.betExecuted = roundData.bullPayout > roundData.bearPayout ? await betUpStrategy(epoch) : await betDownStrategy(epoch);
    }
    return betRoundEvent;
  };

  const isQuoteStrategy = () => {
    return GLOBAL_CONFIG.SELECTED_STRATEGY == QUOTE_STRATEGY;
  };

  module.exports = {
    executeStrategyWithQuotes,
    isQuoteStrategy
};