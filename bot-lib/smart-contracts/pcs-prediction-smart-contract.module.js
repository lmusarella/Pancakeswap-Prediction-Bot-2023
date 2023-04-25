/**
 * Module that defines the functions for interacting directly with the smart contracts involved, defines the functions for reading data and the functions for writing data, on the blockchain on which the smart contracts are deployed
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require('ethers');
const { signer, getGasPrice } = require('../wallet/wallet.module');
const { BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS } = require("../common/constants/smart-contract.constants");
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BNB_CRYPTO, CRYPTO_DECIMAL } = require("../common/constants/bot.constants");
const bnbPredictionGameAbi = require("./json_abi/bnb_smartcontract_bet_abi.json");
const cakePredictionGameAbi = require("./json_abi/cake_smartcontract_bet_abi.json");
const { reduceWaitingTimeByTwoBlocks, parseBetAmount, fixedFloatNumber, formatUnit, parseRoundDataFromSmartContract, getCrypto } = require('../common/utils.module');
const { printTransactionError } = require('../common/print.module');

/**
 * Initialization of BNB_PREDICTON_GAME_SMARTCONTRACT
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @type {ethers.Contract}
 */
const bnbPredictionGameSmartContract = new ethers.Contract(BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, bnbPredictionGameAbi, signer);

/**
 * Initialization of CAKE_PREDICTON_GAME_SMARTCONTRACT
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @type {ethers.Contract}
 */
const cakePredictionGameSmartContract = new ethers.Contract(CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, cakePredictionGameAbi, signer);

/**
 * Runtime Local state for smart contract configuration, define the smart contract selected (BNB game o CAKE game) 
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @type {{ smartContractSelected: ethers.Contract; smartContractSelectedAddress: String; }}
 */
const SMART_CONTRACT_CONFIG = {
  smartContractSelected: bnbPredictionGameSmartContract,
  smartContractSelectedAddress: BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS
}

/**
 * 
 * Based on the selected crypto and passed as input, the related smart contract is set
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @param {String} crypto
 */
const setSmartContratConfig = (crypto) => {
  SMART_CONTRACT_CONFIG.smartContractSelected = crypto === BNB_CRYPTO ? bnbPredictionGameSmartContract : cakePredictionGameSmartContract;
  SMART_CONTRACT_CONFIG.smartContractSelectedAddress = crypto === BNB_CRYPTO ? BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS : CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS;
}

/**
 * Return the selected smart contract
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @returns {ethers.Contract}
 */
const getSmartContract = () => {
  return SMART_CONTRACT_CONFIG.smartContractSelected;
}

/**
 * Return the selected smart contract address
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @returns {String}
 */
const getSmartContractAddress = () => {
  return SMART_CONTRACT_CONFIG.smartContractSelectedAddress;
}

/**
 * Return the min possible bet amount according to the smart contract, calling the "minBetAmount" read function
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @async
 * @returns {Number}
 */
const getMinBetAmount = async () => {
  return fixedFloatNumber(formatUnit(await getSmartContract().minBetAmount(), "18"), CRYPTO_DECIMAL);
}

/**
 * Return the current live round
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @async
 * @returns {Number}
 */
const getCurrentEpoch = async () => {
  return formatUnit(await getSmartContract().currentEpoch());
}

/**
 * Return all utils data from the round passed in input.
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @async
 * @param {Number | ethers.BigNumber} round
 * @returns {{round: Number, openPrice: Number, closePrice: Number, bullAmount: Number, bearAmount: Number, bullPayout: Number, bearPayout: Number, validQuotes: Boolean, winner: String}}
 */
const getRoundData = async (round) => {
  return parseRoundDataFromSmartContract(round, await getSmartContract().rounds(round));
}

/**
 * Check if the round has any rewards to claim, for your address
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @async
 * @param {ethers.BigNumber} round
 * @returns {Boolean}
 */
const isClaimableRound = async (round) => {
  return getSmartContract().claimable(round, process.env.PERSONAL_WALLET_ADDRESS);
}

/**
 * Try to claim rounds's rewards passed in input, and process the transaction. Returns the status of the transaction and the fees spent
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @async
 * @param {ethers.BigNumber[]} rounds
 * @returns {{ status: Number, txGasFee: Number, transactionExeption: Boolean}}
 */
const claimRewards = async (rounds) => {
  try {
    const tx = await getSmartContract().claim(rounds);
    const receipt = await tx.wait();
    const gasUsed = formatUnit(receipt.gasUsed);
    const effectiveGasPrice = formatUnit(receipt.effectiveGasPrice);
    const txGasFee = formatUnit(gasUsed * effectiveGasPrice, "18");
    return { status: receipt.status, txGasFee: txGasFee };
  } catch (e) {
    printTransactionError(e, e.error, rounds);
    return { status: 0, transactionExeption: true };
  }
};

/**
 * Try to bet up, and process the transaction. Returns the status of the transaction and the fees spent. If SIMULATION_MODE is TRUE return a fake transaction.
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @async
 * @param {Number} amount - bet amount
 * @param {ethers.BigNumber} epoch - round
 * @returns {{ status: Number, gasUsed: Number, effectiveGasPrice: Number, transactionExeption: Boolean}}
 */
const betUp = async (amount, epoch) => {
  try {
    if (!GLOBAL_CONFIG.SIMULATION_MODE) {
      const tx = await getSmartContract().betBull(epoch, getAmountValue(amount));
      return await tx.wait();
    } else {
      return {
        status: 1,
        gasUsed: GLOBAL_CONFIG.SIMULATE_ESTIMATE_GAS,
        effectiveGasPrice: await getGasPrice()
      };
    }
  } catch (e) {
    GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(GLOBAL_CONFIG.WAITING_TIME);
    printTransactionError(e, e.error, epoch);
    return { status: 0, transactionExeption: true };
  }
};

/**
 * Try to bet down, and process the transaction. Returns the status of the transaction and the fees spent. If SIMULATION_MODE is TRUE return a fake transaction.
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @async
 * @param {Number} amount - bet amount
 * @param {ethers.BigNumber} epoch - round
 * @returns {{ status: Number, gasUsed: Number, effectiveGasPrice: Number, transactionExeption: Boolean}}
 */
const betDown = async (amount, epoch) => {
  try {
    if (!GLOBAL_CONFIG.SIMULATION_MODE) {
      const tx = await getSmartContract().betBear(epoch, getAmountValue(amount));
      return await tx.wait();
    } else {
      return {
        status: 1,
        gasUsed: GLOBAL_CONFIG.SIMULATE_ESTIMATE_GAS,
        effectiveGasPrice: await getGasPrice()
      };
    }
  } catch (e) {
    GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(GLOBAL_CONFIG.WAITING_TIME);
    printTransactionError(e, e.error, epoch);
    return { status: 0, transactionExeption: true };
  }
};

/**
 * Parse the bet amount value, according to smart contract request input.
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @param {Number} amount - bet amount
 * @returns {ethers.BigNumber}
 */
const getAmountValue = (amount) => {
  //BNB pancakeswap smart contract needs { value: BigNumber }
  //CAKE pancakeswap smart contract needs BigNumber
  return getCrypto() === BNB_CRYPTO ? { value: parseBetAmount(amount) } : parseBetAmount(amount);
}

module.exports = {
  setSmartContratConfig,
  getSmartContract,
  getSmartContractAddress,
  getRoundData,
  getMinBetAmount,
  betDown,
  betUp,
  isClaimableRound,
  claimRewards,
  getCurrentEpoch
};
