/**
 * @Module 
 * @author luca.musarella
 */
const {ethers} = require('ethers');
const {signer, getPersonalWalletAddress} = require('../wallet/wallet.module');
const {CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS} = require("../../bot-configuration/constants/smart-contract.constants");
const {GLOBAL_CONFIG} = require("../../bot-configuration/bot-configuration");
const {CAKE_CRYPTO} = require("../../bot-configuration/constants/bot.constants");
const cakePredictionGameAbi = require("../../bot-configuration/json_abi/cake_smartcontract_bet_abi.json");
const {reduceWaitingTimeByTwoBlocks, parseEther} = require('../utils.module');

const STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION;
const cakePredictionGameSmartContract = new ethers.Contract(CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, cakePredictionGameAbi, signer);

const getRoundDataCake = async (round) => {
    return cakePredictionGameSmartContract.rounds(round);
}

const getCakeMinBetAmount = async () => {
  return cakePredictionGameSmartContract.minBetAmount();
}

const isClaimableRoundCake = async (round) => {
  const personalWalletAddress = await getPersonalWalletAddress();
  return cakePredictionGameSmartContract.claimable(round, personalWalletAddress);
}

const claimRewardsCake = async (rounds) => {
  try {
    const tx = await cakePredictionGameSmartContract.claim(rounds);
    await tx.wait();
  } catch (error) {
    console.log("Transaction Error", error);
  }
};

const betUpCake = async (amount, epoch) => {
    try {
      if(!STRATEGY_CONFIG.SIMULATION_MODE) {
        const tx = await cakePredictionGameSmartContract.betBull(epoch, {value: parseEther(amount)});
        await tx.wait();
      }
      console.log(`🤞 Successful bet of ${amount} ${CAKE_CRYPTO} to UP 🍀`);
      console.log(`--------------------------------`);
    } catch (error) {
      console.log("Transaction Error", error);
      STRATEGY_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        STRATEGY_CONFIG.WAITING_TIME
      );
    }
  };
  
  const betDownCake = async (amount, epoch) => {
    try {
      if(!STRATEGY_CONFIG.SIMULATION_MODE) {
        const tx = await cakePredictionGameSmartContract.betBear(epoch, {value: parseEther(amount)});
        await tx.wait();
      }
      console.log(`🤞 Successful bet of ${amount} ${CAKE_CRYPTO} to DOWN 🍁`);
      console.log(`--------------------------------`);
    } catch (error) {
      console.log("Transaction Error", error);
      STRATEGY_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        STRATEGY_CONFIG.WAITING_TIME
      );
    }
  };

module.exports = {
    cakePredictionGameSmartContract,
    getRoundDataCake,
    getCakeMinBetAmount,
    betUpCake,
    betDownCake,
    isClaimableRoundCake,
    claimRewardsCake
};