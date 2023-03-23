/**
 * @Module 
 * @author luca.musarella
 */
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, COPY_TRADING_STRATEGY } = require("../common/constants/bot.constants");
const { printSectionSeparator } = require("../common/print.module");
const { saveRoundUsersInHistory, getUserActivityFromHistory, saveUserActivityInHistory } = require("../history/history.module");
const { betDownStrategy, betUpStrategy } = require("./bet-strategy.module");

const COPY_TRADING_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY;

const roundUsers = new Map();

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

const registerUser = (round, wallet, bet, betAmount) => {
    const currentRoundUsers = roundUsers.get(round);
    if (currentRoundUsers) {
        currentRoundUsers.push({ wallet: wallet, bet: bet, betAmount: betAmount });
    } else {
        roundUsers.set(round, [{ wallet: wallet, bet: bet, betAmount: betAmount }]);
    }
}

const registerUserActivity = (usersActivity, round, wallet) => {
    const activity = usersActivity[wallet];
    if (activity) {
        activity.rounds.push(round);
        activity.roundsPlayed = activity.rounds.length;
    } else {
        usersActivity[wallet] = { roundsPlayed: 1, rounds: [round] };
    }
}

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