/**
 * Module that exposes the useful functions for the management of the quote strategy
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require("ethers");
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, QUOTE_STRATEGY } = require("../common/constants/bot.constants");
const { getRoundData } = require("../smart-contracts/pcs-prediction-smart-contract.module");
const { betDownStrategy, betUpStrategy } = require("./bet-strategy.module");
const { CONSOLE_STRINGS } = require("../common/constants/strings.constants");
const { evalString } = require("../common/print.module");
const QUOTE_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.QUOTE_STRATEGY;

/**
 * Retrieve current round data and check the quotes, according to quote strategy configuration execute the betStrategies.
 * @date 4/25/2023 - 6:32:59 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @param {any} betRoundEvent - Bet Round Event object
 * @returns {any} - Bet Round Event object
 */
const executeStrategyWithQuotes = async (epoch, betRoundEvent) => {
  const roundData = await getRoundData(epoch);
  if (!roundData.validQuotes) {
    betRoundEvent.skipRound = true;
    betRoundEvent.message = CONSOLE_STRINGS.WARNING_MESSAGE.INCONSISTENT_QUOTAS;
    return betRoundEvent;
  }
  betRoundEvent.bullPayout = roundData.bullPayout;
  betRoundEvent.bearPayout = roundData.bearPayout;
  betRoundEvent.message = evalString(CONSOLE_STRINGS.INFO_MESSAGE.CURRENT_QUOTE_MESSAGE, { bullPayout: betRoundEvent.bullPayout, bearPayout: betRoundEvent.bearPayout });
  if (QUOTE_STRATEGY_CONFIG.SELECT_LOWER_QUOTE) {
    betRoundEvent.bet = roundData.bullPayout > roundData.bearPayout ? BET_DOWN : BET_UP;
    betRoundEvent.betExecuted = roundData.bullPayout > roundData.bearPayout ? await betDownStrategy(epoch) : await betUpStrategy(epoch);
  } else {
    betRoundEvent.bet = roundData.bullPayout > roundData.bearPayout ? BET_UP : BET_DOWN;
    betRoundEvent.betExecuted = roundData.bullPayout > roundData.bearPayout ? await betUpStrategy(epoch) : await betDownStrategy(epoch);
  }
  return betRoundEvent;
};

/**
 * Check if the strategy selected is QUOTE_STRATEGY
 * @date 4/25/2023 - 6:32:59 PM
 *
 * @returns {boolean}
 */
const isQuoteStrategy = () => {
  return GLOBAL_CONFIG.SELECTED_STRATEGY == QUOTE_STRATEGY;
};

module.exports = {
  executeStrategyWithQuotes,
  isQuoteStrategy
};