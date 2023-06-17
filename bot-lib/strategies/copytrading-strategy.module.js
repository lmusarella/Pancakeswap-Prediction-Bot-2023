/**
 * Module that exposes the useful functions for the management of the coytrading strategy, also manages the registration of users who bet and monitors their activity in real time
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require("ethers");
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, COPY_TRADING_STRATEGY } = require("../common/constants/bot.constants");
const { printMostActiveUserMessage, evalString } = require("../common/print.module");
const { getUserActivityFromHistory, saveUserActivityInHistory } = require("../history/history.module");
const { betDownStrategy, betUpStrategy } = require("./bet-strategy.module");
const { CONSOLE_STRINGS } = require("../common/constants/strings.constants");
const COPY_TRADING_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY;

/**
 * Map where the current data of the user for specific round.
 * @date 4/25/2023 - 5:46:27 PM
 *
 * @type {Map<number, any}
 */
const roundUsers = new Map();

/**
 * Execute Bet DOWN Strategy and update the Bet Round Event object
 * @date 4/25/2023 - 5:46:27 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @param {any} betRoundEvent - Bet Round Event object
 * @returns {any} - Bet Round Event object
 */
const executeBetDownCopyTradingStrategy = async (epoch, betRoundEvent) => {
    const txReceipt = await betDownStrategy(epoch);
    betRoundEvent.betExecuted = txReceipt.betExecuted;
    betRoundEvent.betAmount = txReceipt.betAmount;
    betRoundEvent.txGasFee = txReceipt.txGasFee;
    betRoundEvent.message = evalString(CONSOLE_STRINGS.INFO_MESSAGE.COPYTRADING_BET_DOWN_MESSAGE, { friendAddress: COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE})
    betRoundEvent.bet = BET_DOWN;
    return betRoundEvent;
}

/**
 * Execute Bet UP Strategy and update the Bet Round Event object
 * @date 4/25/2023 - 5:46:27 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @param {any} betRoundEvent - Bet Round Event object
 * @returns {any} - Bet Round Event object
 */
const executeBetUpCopyTradingStrategy = async (epoch, betRoundEvent) => {
    const txReceipt = await betUpStrategy(epoch);
    betRoundEvent.betExecuted = txReceipt.betExecuted;
    betRoundEvent.betAmount = txReceipt.betAmount;
    betRoundEvent.txGasFee = txReceipt.txGasFee;
    betRoundEvent.message = evalString(CONSOLE_STRINGS.INFO_MESSAGE.COPYTRADING_BET_UP_MESSAGE, { friendAddress: COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE})
    betRoundEvent.bet = BET_UP;
    return betRoundEvent;
}

/**
 * Check if the strategy selected is COPY_TRADING_STRATEGY
 * @date 4/25/2023 - 5:46:27 PM
 *
 * @returns {boolean}
 */
const isCopyTradingStrategy = () => {
    return GLOBAL_CONFIG.STRATEGY_CONFIGURATION.SELECTED_STRATEGY == COPY_TRADING_STRATEGY;
};

/**
 * Save user round bet
 * @date 4/25/2023 - 5:46:27 PM
 *
 * @param {number} round
 * @param {string} wallet - address
 * @param {string} bet -  "bear" or "bull"
 * @param {number} betAmount
 */
const registerUser = (round, wallet, bet, betAmount) => {
    const currentRoundUsers = roundUsers.get(round);
    if (currentRoundUsers) {
        currentRoundUsers.push({ wallet: wallet, bet: bet, betAmount: betAmount });
    } else {
        roundUsers.set(round, [{ wallet: wallet, bet: bet, betAmount: betAmount }]);
    }
}

/**
 * Register user activity
 * @date 4/25/2023 - 5:46:27 PM
 *
 * @param {any} usersActivity
 * @param {number} round
 * @param {any} userRoundActivity - user round activity
 */
const registerRoundUserActivity = (usersActivity, round, userRoundActivity) => {
    const activity = usersActivity[userRoundActivity.wallet];
    if (activity) {
        activity.rounds.push({round: round, bet: userRoundActivity.bet, betAmount: userRoundActivity.betAmount});
        activity.totalAmountBetted += userRoundActivity.betAmount; 
        activity.roundsPlayed = activity.rounds.length;
    } else {
        usersActivity[userRoundActivity.wallet] = { roundsPlayed: 1, totalAmountBetted: userRoundActivity.betAmount, rounds: [{round: round, bet: userRoundActivity.bet, betAmount: userRoundActivity.betAmount}] };
    }
}

/**
 * Retrive alla user bet activity of the specific round and merge in global user activity
 * @date 4/25/2023 - 5:46:27 PM
 *
 * @async
 * @param {number} round
 */
const handleUsersActivity = async (round) => {
    const usersRoundActivity = roundUsers.get(round);
    const usersActivity = await getUserActivityFromHistory();
    if (!usersRoundActivity) {
        return;
    }
    usersRoundActivity.forEach(userRoundActivity => { registerRoundUserActivity(usersActivity, round, userRoundActivity); });
    saveUserActivityInHistory(usersActivity);
    roundUsers.delete(round);
}

/**
 * Print the most active user
 * @date 4/25/2023 - 5:46:27 PM
 *
 * @async
 */
const getMostActiveUser = async () => {
    const usersActivity = await getUserActivityFromHistory();
    const users = Object.keys(usersActivity);
    const activeUser = users.reduce((prev, current) => (usersActivity[prev].roundsPlayed > usersActivity[current].roundsPlayed) ? prev : current);
    printMostActiveUserMessage(activeUser, usersActivity[activeUser].roundsPlayed)
}

module.exports = {
    executeBetDownCopyTradingStrategy,
    executeBetUpCopyTradingStrategy,
    isCopyTradingStrategy,
    registerUser,
    handleUsersActivity,
    getMostActiveUser
};