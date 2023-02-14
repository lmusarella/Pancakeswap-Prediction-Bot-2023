/**
 * @Module 
 * @author luca.musarella
 */
const {ethers} = require('ethers');
const {signer, getPersonalWalletAddress} = require('../wallet/wallet.module');
const {BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS} = require("../../bot-configuration/constants/smart-contract.constants");
const {GLOBAL_CONFIG} = require("../../bot-configuration/bot-configuration");
const {BNB_CRYPTO} = require("../../bot-configuration/constants/bot.constants");
const bnbPredictionGameAbi = require("../../bot-configuration/json_abi/bnb_smartcontract_bet_abi.json");
const {reduceWaitingTimeByTwoBlocks, parseEther} = require('../utils.module');

const STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION;
const bnbPredictionGameSmartContract = new ethers.Contract(BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, bnbPredictionGameAbi, signer);

const getRoundDataBNB = async (round) => {
    return bnbPredictionGameSmartContract.rounds(round);
}

const getBNBMinBetAmount = async () => {
  return bnbPredictionGameSmartContract.minBetAmount();
}

const isClaimableRoundBNB = async (round) => {
  const personalWalletAddress = await getPersonalWalletAddress();
  return bnbPredictionGameSmartContract.claimable(round, personalWalletAddress);
}

const claimRewardsBNB = async (rounds) => {
  try {
    const tx = await bnbPredictionGameSmartContract.claim(rounds);
    await tx.wait();
  } catch (error) {
    console.log("Transaction Error", error);
  }
};

const betUpBNB = async (amount, epoch) => {
    try {
      if(!STRATEGY_CONFIG.SIMULATION_MODE) {
        const tx = await bnbPredictionGameSmartContract.betBull(epoch, {value: parseEther(amount)});
        await tx.wait();
      }
      console.log(`🤞 Successful bet of ${amount} ${BNB_CRYPTO} to UP 🟢`);
      console.log(`--------------------------------`);
    } catch (error) {
      console.log("Transaction Error", error);
      STRATEGY_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        STRATEGY_CONFIG.WAITING_TIME
      );
    }
  };
  
  const betDownBNB = async (amount, epoch) => {
    try {
      if(!STRATEGY_CONFIG.SIMULATION_MODE) {
        const tx = await bnbPredictionGameSmartContract.betBear(epoch, {value: parseEther(amount)});
        await tx.wait();
      }
      console.log(`🤞 Successful bet of ${amount} ${BNB_CRYPTO} to DOWN 🍁`);
      console.log(`--------------------------------`);
    } catch (error) {
      console.log("Transaction Error", error);
      STRATEGY_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        STRATEGY_CONFIG.WAITING_TIME
      );
    }
};

module.exports = {
    bnbPredictionGameSmartContract,
    getRoundDataBNB,
    getBNBMinBetAmount,
    betDownBNB,
    betUpBNB,
    isClaimableRoundBNB,
    claimRewardsBNB
};