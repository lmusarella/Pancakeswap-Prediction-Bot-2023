/**
 * Module that exposes the useful functions for the management of the coytrading strategy, also manages the registration of users who bet and monitors their activity in real time
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require("ethers");
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, COPY_TRADING_STRATEGY } = require("../common/constants/bot.constants");
const { printSectionSeparator } = require("../common/print.module");
const { saveRoundUsersInHistory, getUserActivityFromHistory, saveUserActivityInHistory } = require("../history/history.module");
const { betDownStrategy, betUpStrategy } = require("./bet-strategy.module");
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
    betRoundEvent.betExecuted = await betDownStrategy(epoch);
    betRoundEvent.message = `🔮 Friend ${COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE} bet to DOWN 🔴`;
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
    betRoundEvent.betExecuted = await betUpStrategy(epoch);
    betRoundEvent.message = `🔮 Friend ${COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE} bet to UP 🟢`;
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
    return GLOBAL_CONFIG.SELECTED_STRATEGY == COPY_TRADING_STRATEGY;
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
 * @param {string} wallet - address
 */
const registerUserActivity = (usersActivity, round, wallet) => {
    const activity = usersActivity[wallet];
    if (activity) {
        activity.rounds.push(round);
        activity.roundsPlayed = activity.rounds.length;
    } else {
        usersActivity[wallet] = { roundsPlayed: 1, rounds: [round] };
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
    const users = roundUsers.get(round);
    let totalBetAmount = 0;
    const usersActivity = await getUserActivityFromHistory();
    if (!users) {
        return;
    }
    users.forEach(user => {
        registerUserActivity(usersActivity, round, user.wallet);
        totalBetAmount += user.betAmount;
    });
    await saveRoundUsersInHistory([{ round: round, usersCount: users.length, totalBetAmount: totalBetAmount, users: users }]);
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
    console.log("💻", "One of the most active players in the last rounds!", [activeUser], 'with:', usersActivity[activeUser].roundsPlayed, 'rounds played!');
    printSectionSeparator();
}

module.exports = {
    executeBetDownCopyTradingStrategy,
    executeBetUpCopyTradingStrategy,
    isCopyTradingStrategy,
    registerUser,
    handleUsersActivity,
    getMostActiveUser
};