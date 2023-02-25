/**
 * @Module 
 * @author luca.musarella
 */
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP, COPY_TRADING_STRATEGY } = require("../common/constants/bot.constants");
const { printSectionSeparator } = require("../common/print.module");
const { formatUnit } = require("../common/utils.module");
const { saveUsersRoundInHistory, getUserActivityFromHistory, saveUserActivityInHistory } = require("../history/history.module");
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
    if(roundUsers.get(round)) {
        currentRoundUsers.push({wallet: wallet, bet: bet, betAmount: betAmount});
    } else {
        roundUsers.set(round, [{wallet: wallet, bet: bet, betAmount: betAmount}]);
    }
}

const handleUsersActivity = async (round, price) => {
    const users = roundUsers.get(formatUnit(round));
    let totalBetAmount = 0;
    let betUpCount = 0;
    let betDownCount = 0;
    const usersActivity = await getUserActivityFromHistory();
    users.forEach(user => {
        const activity = usersActivity[user.wallet];
        if(activity) {
            activity.rounds.push(formatUnit(round));
            activity.roundPlayed = activity.rounds.length;
        } else {
            usersActivity[user.wallet] = { roundPlayed: 1, rounds: [formatUnit(round)]};
        }
        totalBetAmount += user.betAmount;
        user.bet === BET_UP ? betUpCount++ : betDownCount++
    });
    await saveUsersRoundInHistory([{round: formatUnit(round), usersCount: users.length, totalBetAmount: parseFloat(price) , betDownCount:betDownCount, betUpCount: betUpCount, users: users}]);
    saveUserActivityInHistory(usersActivity);
    roundUsers.delete(round);
}

const getMostActiveUser = async () => {
    const usersActivity = await getUserActivityFromHistory();
    const users = Object.keys(usersActivity);
    const activeUser = users.reduce((prev, current) => (usersActivity[prev].roundPlayed > usersActivity[current].roundPlayed) ? prev : current);
    console.log("💻", "One of the most active players in the last rounds!", [activeUser], 'with:' , usersActivity[activeUser].roundPlayed, 'rounds played!');
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