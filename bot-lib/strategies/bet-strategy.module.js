/**
 * @Module 
 * @author luca.musarella
 */
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_DOWN, BET_UP } = require("../common/constants/bot.constants");
const { parseFromUsdToCrypto, formatUnit } = require("../common/utils.module");
const { saveRoundInHistory } = require("../history/history.module");
const { betUp, betDown } = require("../smart-contracts/pcs-prediction-smart-contract.module");
const { getSimulationBalance, updateSimulationBalance } = require("../wallet/wallet.module");

const BET_CONFIG = GLOBAL_CONFIG.BET_CONFIGURATION;

const betDownStrategy = async (epoch) => {
    const cryptoBetAmount = parseFromUsdToCrypto(BET_CONFIG.BET_AMOUNT);
    const transaction = parseTransactionReceipt(await betDown(cryptoBetAmount, epoch));
    if (GLOBAL_CONFIG.SIMULATION_MODE) {
        updateSimulationBalance(getSimulationBalance() - cryptoBetAmount - transaction.txGasFee);
    }
    await saveRoundInHistory({ round: formatUnit(epoch), betAmount: cryptoBetAmount, bet: BET_DOWN, betExecuted: transaction.betExecuted, txGasFee: transaction.txGasFee });
    return transaction.betExecuted;
}

const betUpStrategy = async (epoch) => {
    const cryptoBetAmount = parseFromUsdToCrypto(BET_CONFIG.BET_AMOUNT);
    const transaction = parseTransactionReceipt(await betUp(cryptoBetAmount, epoch));
    if (GLOBAL_CONFIG.SIMULATION_MODE) {
        updateSimulationBalance(getSimulationBalance() - cryptoBetAmount - transaction.txGasFee);
    }
    await saveRoundInHistory({ round: formatUnit(epoch), betAmount: cryptoBetAmount, bet: BET_UP, betExecuted: transaction.betExecuted, txGasFee: transaction.txGasFee });
    return transaction.betExecuted;
}

const parseTransactionReceipt = (txReceipt) => {
    const betExecuted = txReceipt.status === 1;
    if (txReceipt.transactionExeption) {
        return { betExecuted: betExecuted, txGasFee: 0 };
    } else {
        const gasUsed = formatUnit(txReceipt.gasUsed);
        const effectiveGasPrice = formatUnit(txReceipt.effectiveGasPrice);
        const txGasFee = formatUnit(gasUsed * effectiveGasPrice, "18");
        return { betExecuted: txReceipt.status === 1, txGasFee: txGasFee };
    }
}

module.exports = {
    betDownStrategy,
    betUpStrategy
};