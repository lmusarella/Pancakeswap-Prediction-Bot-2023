const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP } = require("../common/constants/bot.constants");
const { parseFromUsdToCrypto, formatUnit } = require("../common/utils.module");
const { saveRoundInHistory } = require("../history/history.module");
const { betUp, betDown } = require("../smart-contracts/pcs-prediction-smart-contract.module");

const BET_CONFIG = GLOBAL_CONFIG.BET_CONFIGURATION;

const betDownStrategy = async (epoch) => { 
    const cryptoBetAmount = parseFromUsdToCrypto(BET_CONFIG.BET_AMOUNT);  
    const betExecuted = await betDown(cryptoBetAmount, epoch);
    await saveRoundInHistory({round: formatUnit(epoch), betAmount: cryptoBetAmount, bet: BET_DOWN, betExecuted: betExecuted});
    return betExecuted;
}

const betUpStrategy = async (epoch) => {
    const cryptoBetAmount = parseFromUsdToCrypto(BET_CONFIG.BET_AMOUNT);
    const betExecuted = await betUp(cryptoBetAmount, epoch);
    await saveRoundInHistory({round: formatUnit(epoch), betAmount: cryptoBetAmount, bet: BET_UP, betExecuted: betExecuted});
    return betExecuted;
}

module.exports = {
    betDownStrategy,
    betUpStrategy
};