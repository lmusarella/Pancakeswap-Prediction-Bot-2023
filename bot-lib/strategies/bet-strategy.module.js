/**
 * The module: BetStrategy exposes the functions that execute the logics for managing the interactions with the smart contract. It calls the functions that interact with it and handle the returned transactions.
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require("ethers");
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { parseFromUsdToCrypto, formatUnit, parseFeeFromCryptoToUsd, getBetAmount } = require("../common/utils.module");
const { betUp, betDown, isClaimableRound, claimRewards } = require("../smart-contracts/pcs-prediction-smart-contract.module");
const { getSimulationBalance, updateSimulationBalance } = require("../wallet/wallet.module");

/**
 * Converts the bet amount from dollars to crypto, calls the function to place the bet down. In case of simulated mode, it updates the fictitious balance
 * @date 4/22/2023 - 3:57:23 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @returns {any} - Tx Custom Recepit
 */
const betDownStrategy = async (epoch) => {
    const cryptoBetAmount = parseFromUsdToCrypto(getBetAmount());
    const transaction = parseTransactionReceipt(await betDown(cryptoBetAmount, epoch));
    if (GLOBAL_CONFIG.SIMULATION_MODE) {
        updateSimulationBalance(getSimulationBalance() - getBetAmount() - parseFeeFromCryptoToUsd(transaction.txGasFee));
    }
    return { betAmount: cryptoBetAmount, betExecuted: transaction.betExecuted, txGasFee: transaction.txGasFee };;
}

/**
 * Converts the bet amount from dollars to crypto, calls the function to place the bet up. In case of simulated mode, it updates the fictitious balance
 * @date 4/22/2023 - 3:57:23 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @returns {any} - Tx Custom Recepit
 */
const betUpStrategy = async (epoch) => {
    const cryptoBetAmount = parseFromUsdToCrypto(getBetAmount());
    const transaction = parseTransactionReceipt(await betUp(cryptoBetAmount, epoch));
    if (GLOBAL_CONFIG.SIMULATION_MODE) {
        updateSimulationBalance(getSimulationBalance() - getBetAmount() - parseFeeFromCryptoToUsd(transaction.txGasFee));
    }
    return { betAmount: cryptoBetAmount, betExecuted: transaction.betExecuted, txGasFee: transaction.txGasFee };
}

/**
 * Check that the incoming passed round can be claimed and that automatic claiming is enabled. If so, it calls the function that executes the claim, if not, it returns a fictitious transaction.
 * @date 4/22/2023 - 3:57:23 PM
 *
 * @async
 * @param {ethers.BigNumber} epoch - round
 * @returns {{ status: Number, txGasFee: Number, transactionExeption: Boolean}} - claim transaction data
 */
const claimStrategy = async (epoch) => {
    if(GLOBAL_CONFIG.STRATEGY_CONFIGURATION.CLAIM_REWARDS && await isClaimableRound(epoch)) {
        return await claimRewards([epoch]);
    } else {
        return { status: 0, txGasFee: 0};
    }
}

/**
 * Parse the transaction receipt from smart contract and calculate the gas fee and if the transaction is OK or KO
 * @date 4/22/2023 - 3:57:23 PM
 *
 * @param {{{ status: Number, gasUsed: Number, effectiveGasPrice: Number, transactionExeption: Boolean}}} txReceipt
 * @returns {{ betExecuted: Boolean; txGasFee: number; }}
 */
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
    betUpStrategy,
    claimStrategy
};