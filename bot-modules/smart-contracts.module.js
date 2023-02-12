/**
 * @Module 
 * @author luca.musarella
 */

const {ethers} = require('ethers');
const {signer, getPersonalWalletAddress} = require('./wallet.module');
const {BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, CAKE_TOKEN_SMARTCONTRACT_ADDRESS} = require("../bot-configuration/constants/smart-contract.constants");
const {GLOBAL_CONFIG} = require("../bot-configuration/constants/bot-global.constants");
const bnbPredictionGameAbi = require("../bot-configuration/json_abi/bnb_smartcontract_bet_abi.json");
const cakePredictionGameAbi = require("../bot-configuration/json_abi/cake_smartcontract_bet_abi.json");
const cakeTokenAbi = require("../bot-configuration/json_abi/cake_smartcontract_abi.json");
const {reduceWaitingTimeByTwoBlocks, parseEther, formatEther} = require('./utils.module');

//Set up the smart contracts
const bnbPredictionGameSmartContract = new ethers.Contract(BNB_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, bnbPredictionGameAbi, signer);
const cakePredictionGameSmartContract = new ethers.Contract(CAKE_PREDICTON_GAME_SMARTCONTRACT_ADDRESS, cakePredictionGameAbi, signer);
const cakeTokenSmartContract = new ethers.Contract(CAKE_TOKEN_SMARTCONTRACT_ADDRESS, cakeTokenAbi, signer);

const getCakeBalance = async (address) => {
    return cakeTokenSmartContract.balanceOf(address);
}

const checkCakeBalance = async (amount) => {
  const personalWalletAddress = await getPersonalWalletAddress();
  const personalCakeBalance = await getCakeBalance(personalWalletAddress);
  if (formatEther(personalCakeBalance) < parseFloat(amount)) {
    console.log("😭 You don't have enough balance :", parseFloat(amount), "CAKE", "|", "Actual Balance:", formatEther(personalCakeBalance), "CAKE");
    process.exit();
  } else {
    console.log(`🤑 Your balance is enough: ${formatEther(personalCakeBalance)} CAKE`);
  }
}

const getRoundDataBNB = async (round) => {
    return bnbPredictionGameSmartContract.rounds(round);
}

const getRoundDataCake = async (round) => {
    return cakePredictionGameSmartContract.rounds(round);
}

const betUpBNB = async (amount, epoch) => {
    try {
      const tx = await bnbPredictionGameSmartContract.betBull(epoch, {
        value: parseEther(amount)
      });
      await tx.wait();
      console.log(`🤞 Successful bet of ${amount} BNB to UP 🍀`);
    } catch (error) {
      console.log("Transaction Error", error);
      GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        GLOBAL_CONFIG.WAITING_TIME
      );
    }
  };
  
  const betDownBNB = async (amount, epoch) => {
    try {
      const tx = await bnbPredictionGameSmartContract.betBear(epoch, {
        value: parseEther(amount)
      });
      await tx.wait();
      console.log(`🤞 Successful bet of ${amount} BNB to DOWN 🍁`);
    } catch (error) {
      console.log("Transaction Error", error);
      GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        GLOBAL_CONFIG.WAITING_TIME
      );
    }
};

const betUpCake = async (amount, epoch) => {
    try {
      const tx = await cakePredictionGameSmartContract.betBull(epoch, {
        value: parseEther(amount)
      });
      await tx.wait();
      console.log(`🤞 Successful bet of ${amount} CAKE to UP 🍀`);
    } catch (error) {
      console.log("Transaction Error", error);
      GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        GLOBAL_CONFIG.WAITING_TIME
      );
    }
  };
  
  //Bet DOWN
  const betDownCake = async (amount, epoch) => {
    try {
      const tx = await cakePredictionGameSmartContract.betBear(epoch, {
        value: parseEther(amount)
      });
      await tx.wait();
      console.log(`🤞 Successful bet of ${amount} CAKE to DOWN 🍁`);
    } catch (error) {
      console.log("Transaction Error", error);
      GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
        GLOBAL_CONFIG.WAITING_TIME
      );
    }
  };

module.exports = {
    bnbPredictionGameSmartContract,
    cakePredictionGameSmartContract,
    cakeTokenSmartContract,
    getCakeBalance,
    getRoundDataBNB,
    getRoundDataCake,
    betDownBNB,
    betUpBNB,
    betUpCake,
    betDownCake,
    checkCakeBalance
};