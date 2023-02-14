/**
 * @Module 
 * @author luca.musarella
 */

const {ethers} = require('ethers');
const {signer} = require('../wallet/wallet.module');
const {CAKE_TOKEN_SMARTCONTRACT_ADDRESS} = require("../../bot-configuration/constants/smart-contract.constants");
const {getPersonalWalletAddress} = require('../wallet/wallet.module');
const {formatEther, stopBotCommand} = require('../utils.module');
const {GLOBAL_CONFIG} = require("../../bot-configuration/bot-configuration");
const {CAKE_CRYPTO} = require("../../bot-configuration/constants/bot.constants");
const cakeTokenAbi = require("../../bot-configuration/json_abi/cake_smartcontract_abi.json");
const STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION;

const cakeTokenSmartContract = new ethers.Contract(CAKE_TOKEN_SMARTCONTRACT_ADDRESS, cakeTokenAbi, signer);

const getCakeBalance = async (address) => {
    return cakeTokenSmartContract.balanceOf(address);
}

const checkCakeBalance = async (amount) => {
    const personalWalletAddress = await getPersonalWalletAddress();
    const personalCakeBalance = await getCakeBalance(personalWalletAddress);
    if (!STRATEGY_CONFIG.SIMULATION_MODE && formatEther(personalCakeBalance) < formatEther(amount)) {
      console.log(`😭 You don't have enough balance :`, formatEther(amount), CAKE_CRYPTO, "|", "Actual Balance:", formatEther(personalCakeBalance), `${CAKE_CRYPTO}. Shuting down... ✨`);
      stopBotCommand();
    } else {
      console.log(`🤑 Your balance is enough: ${(STRATEGY_CONFIG.SIMULATION_MODE ? STRATEGY_CONFIG.SIMULATION_BALANCE : personalCakeBalance)} ${CAKE_CRYPTO}`);
    }
}
  

module.exports = {
    cakeTokenSmartContract,
    getCakeBalance,
    checkCakeBalance
};