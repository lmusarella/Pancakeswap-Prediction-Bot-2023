/**
 * @Module 
 * @author luca.musarella
 */
const {ethers} = require('ethers');
const {signer, updateSimulationBalance, getSimulationBalance} = require('../wallet/wallet.module');
const {BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS} = require("../common/constants/smart-contract.constants");
const {GLOBAL_CONFIG} = require("../../bot-configuration/bot-configuration");
const {BNB_CRYPTO, CRYPTO_DECIMAL} = require("../common/constants/bot.constants");
const bnbPredictionGameAbi = require("./json_abi/bnb_smartcontract_bet_abi.json");
const cakePredictionGameAbi = require("./json_abi/cake_smartcontract_bet_abi.json");
const {reduceWaitingTimeByTwoBlocks, parseBetAmount, fixedFloatNumber, formatUnit, parseRoundDataFromSmartContract} = require('../common/utils.module');
const { printTransactionError } = require('../common/print.module');

const bnbPredictionGameSmartContract = new ethers.Contract(BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, bnbPredictionGameAbi, signer);
const cakePredictionGameSmartContract = new ethers.Contract(CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, cakePredictionGameAbi, signer);

//Default Config
const SMART_CONTRACT_CONFIG = {
  smartContractSelected: bnbPredictionGameSmartContract,
  smartContractSelectedAddress: BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS
}

const setSmartContratConfig = (crypto) => {
  SMART_CONTRACT_CONFIG.smartContractSelected = crypto === BNB_CRYPTO ? bnbPredictionGameSmartContract : cakePredictionGameSmartContract;
  SMART_CONTRACT_CONFIG.smartContractSelectedAddress = crypto === BNB_CRYPTO ? BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS : CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS;  
}

const getSmartContract = () => {
  return SMART_CONTRACT_CONFIG.smartContractSelected;
}

const getSmartContractAddress = () => {
  return SMART_CONTRACT_CONFIG.smartContractSelectedAddress;
}

const getMinBetAmount = async () => {
  return fixedFloatNumber(formatUnit(await getSmartContract().minBetAmount(), "18"), CRYPTO_DECIMAL);
}

const getCurrentEpoch = async () => {
  return formatUnit(await getSmartContract().currentEpoch());
}

const getRoundData = async (round) => {
    return parseRoundDataFromSmartContract(round, await getSmartContract().rounds(round));
}

const isClaimableRound = async (round) => {
  return getSmartContract().claimable(round, process.env.PERSONAL_WALLET_ADDRESS);
}

const claimRewards = async (rounds) => {
  try {
    const tx = await getSmartContract().claim(rounds);
    await tx.wait();
    return true;
  } catch (error) {
    printTransactionError(error);
    return false;
  }
};

const betUp = async (amount, epoch) => {
    try {
      if(!GLOBAL_CONFIG.SIMULATION_MODE) {
        const tx = await getSmartContract().betBull(epoch, {value: parseBetAmount(amount)});
        await tx.wait();
      } else {
        updateSimulationBalance(getSimulationBalance() - amount);
      }     
      return true;
    } catch (error) {
      GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(GLOBAL_CONFIG.WAITING_TIME);
      printTransactionError(error);
      return false;
    }
  };
  
  const betDown = async (amount, epoch) => {
    try {
      if(!GLOBAL_CONFIG.SIMULATION_MODE) {
        const tx = await getSmartContract().betBear(epoch, {value: parseBetAmount(amount)});
        await tx.wait();
      } else {
        updateSimulationBalance(getSimulationBalance() - amount);
      }
      return true;
    } catch (error) {
      GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(GLOBAL_CONFIG.WAITING_TIME);
      printTransactionError(error);
      return false;
    }
};

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