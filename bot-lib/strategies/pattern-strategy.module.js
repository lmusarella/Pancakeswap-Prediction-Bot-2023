/**
 * Module that exposes the useful functions for the management of the pattern strategy
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require("ethers");
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, PATTERN_STRATEGY, BNB_CRYPTO } = require("../common/constants/bot.constants");
const { getRoundData } = require("../smart-contracts/pcs-prediction-smart-contract.module");
const { betDownStrategy, betUpStrategy } = require("./bet-strategy.module");
const { CONSOLE_STRINGS } = require("../common/constants/strings.constants");
const { evalString } = require("../common/print.module");
const { getCrypto } = require("../common/utils.module");
const { getRoundsFromHistory, ALL_ROUND_HISTORY_FILENAME } = require("../history/history.module");
const { getOracleBnbPrice } = require("../smart-contracts/bnb-price-feed-smart-contract.module");
const { getOracleCakePrice } = require("../smart-contracts/cake-price-feed-smart-contract.module");
const PATTERN_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.PATTERN_STRATEGY;

/**
 * The method checks the number of events/candlesticks from previous rounds, checks if there is a repetition of "bear" or "bull" events. If so, it proceeds to place the bet on the current round on the opposite event of the pattern found.
 * @date 4/25/2023 - 6:32:59 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @param {any} betRoundEvent - Bet Round Event object
 * @returns {any} - Bet Round Event object
 */
const executeStrategyWithPatterns = async (epoch, betRoundEvent) => {
    const eventsNumberToCheck = PATTERN_STRATEGY_CONFIG.EVENT_PATTERN_NUMBER - 1;
    const roundsHystory = await getRoundsFromHistory(ALL_ROUND_HISTORY_FILENAME);

    const events = [];
    for (let i = 0; i < eventsNumberToCheck; i++) {
        if (roundsHystory && roundsHystory.length) {
            const lastRound = roundsHystory.pop();
            events.push(lastRound.winner);
        }
    }

    if (events.length < eventsNumberToCheck) {
        betRoundEvent.skipRound = true;
        betRoundEvent.message = evalString(CONSOLE_STRINGS.INFO_MESSAGE.EVENT_PATTERN_NOT_FOUND, { event: BET_UP + "/" + BET_DOWN, n: PATTERN_STRATEGY_CONFIG.EVENT_PATTERN_NUMBER });
        return betRoundEvent;
    }

    const roundFinishLastRoundData = await getRoundData(epoch.toNumber() - 1);
    const oracleCurrentPrice = getCrypto() === BNB_CRYPTO ? await getOracleBnbPrice() : await getOracleCakePrice();
    const delta = oracleCurrentPrice - roundFinishLastRoundData.openPrice;

    if (delta < 0 && Math.abs(delta) > PATTERN_STRATEGY_CONFIG.DELTA_PRICE_THRESHOLD) {
        events.push(BET_DOWN);
    } else if (delta > 0 && Math.abs(delta) > PATTERN_STRATEGY_CONFIG.DELTA_PRICE_THRESHOLD) {
        events.push(BET_UP);
    } else {
        betRoundEvent.skipRound = true;
        betRoundEvent.message = evalString(CONSOLE_STRINGS.INFO_MESSAGE.EVENT_NOT_PREDICTABLE, { round: epoch.toNumber() - 1, difference: Math.abs(delta), threshold: PATTERN_STRATEGY_CONFIG.DELTA_PRICE_THRESHOLD });
        return betRoundEvent;
    }
    if (events.every(event => event == BET_UP)) {
        const txReceipt = await betDownStrategy(epoch);
        betRoundEvent.bet = BET_DOWN;
        betRoundEvent.betExecuted = txReceipt.betExecuted;
        betRoundEvent.betAmount = txReceipt.betAmount;
        betRoundEvent.txGasFee = txReceipt.txGasFee;
        betRoundEvent.message = evalString(CONSOLE_STRINGS.INFO_MESSAGE.PATTERN_STATEGY_BET_MESSAGE, { res: BET_UP, previous: epoch.toNumber() - 1, numberEvent: PATTERN_STRATEGY_CONFIG.EVENT_PATTERN_NUMBER });
        betRoundEvent.pricemessage = evalString(CONSOLE_STRINGS.INFO_MESSAGE.PATTERN_STATEGY_PRICE_MESSAGE, { current: roundFinishLastRoundData.openPrice > oracleCurrentPrice ? CONSOLE_STRINGS.LESS : CONSOLE_STRINGS.GREATER, res: BET_UP, previous: epoch.toNumber() - 1, numberEvent: PATTERN_STRATEGY_CONFIG.EVENT_PATTERN_NUMBER, currentPrice: oracleCurrentPrice, openPrice: roundFinishLastRoundData.openPrice, difference: delta });
   
    } else if (events.every(event => event == BET_DOWN)) {
        const txReceipt = await betUpStrategy(epoch);
        betRoundEvent.bet = BET_UP;
        betRoundEvent.betExecuted = txReceipt.betExecuted;
        betRoundEvent.betAmount = txReceipt.betAmount;
        betRoundEvent.txGasFee = txReceipt.txGasFee;
        betRoundEvent.message = evalString(CONSOLE_STRINGS.INFO_MESSAGE.PATTERN_STATEGY_BET_MESSAGE, {res: BET_DOWN, previous: epoch.toNumber() - 1, numberEvent: PATTERN_STRATEGY_CONFIG.EVENT_PATTERN_NUMBER});
        betRoundEvent.pricemessage = evalString(CONSOLE_STRINGS.INFO_MESSAGE.PATTERN_STATEGY_PRICE_MESSAGE, { current: roundFinishLastRoundData.openPrice > oracleCurrentPrice ? CONSOLE_STRINGS.LESS : CONSOLE_STRINGS.GREATER, res: BET_UP, previous: epoch.toNumber() - 1, numberEvent: PATTERN_STRATEGY_CONFIG.EVENT_PATTERN_NUMBER, currentPrice: oracleCurrentPrice, openPrice: roundFinishLastRoundData.openPrice, difference: delta });  
    } else {
        betRoundEvent.skipRound = true;
        betRoundEvent.message = evalString(CONSOLE_STRINGS.INFO_MESSAGE.EVENT_PATTERN_NOT_FOUND, { event: BET_UP + "/" + BET_DOWN, n: PATTERN_STRATEGY_CONFIG.EVENT_PATTERN_NUMBER });
    }

    return betRoundEvent;
};

/**
 * Check if the strategy selected is PATTERN_STRATEGY
 * @date 4/25/2023 - 6:32:59 PM
 *
 * @returns {boolean}
 */
const isPatternStrategy = () => {
    return GLOBAL_CONFIG.STRATEGY_CONFIGURATION.SELECTED_STRATEGY == PATTERN_STRATEGY;
};

module.exports = {
    executeStrategyWithPatterns,
    isPatternStrategy
};