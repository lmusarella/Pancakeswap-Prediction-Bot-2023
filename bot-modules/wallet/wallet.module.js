/**
 * @Module 
 * @author luca.musarella
 */
const {ethers} = require('ethers');
const {formatEther, stopBotCommand} = require('../utils.module');
const {GLOBAL_CONFIG} = require("../../bot-configuration/bot-configuration");
const {BNB_CRYPTO} = require("../../bot-configuration/constants/bot.constants");
const dotenv = require('dotenv');
const result = dotenv.config();
const STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION;

if (result.error) {
  throw result.error;
}

//Set up personal wallet
const wallet = new ethers.Wallet(process.env.PERSONAL_WALLET_PRIVATE_KEY);

//Set up node (bsc chain) to interact with the smart contract
const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_NODE_PROVIDER_URL);
const signer = wallet.connect(provider);

const getPersonalBalance = async () => {
    return signer.getBalance();
}

const getPersonalWalletAddress = async () => {
  return signer.getAddress();
}

const checkBalance = async (amount) => {
  const personalBalance = await getPersonalBalance();
  if (!STRATEGY_CONFIG.SIMULATION_MODE && formatEther(personalBalance) < formatEther(amount)) {
    console.log("😭 You don't have enough balance :", formatEther(amount), BNB_CRYPTO, "|", "Actual Balance:", formatEther(personalBalance), `${BNB_CRYPTO}. Shuting down... ✨`);
    stopBotCommand();
  } else {
    console.log(`🤑 Your balance is enough: ${(STRATEGY_CONFIG.SIMULATION_MODE ? STRATEGY_CONFIG.SIMULATION_BALANCE : personalBalance)} ${BNB_CRYPTO}`);
  }
};

module.exports = {
    wallet,
    provider,
    signer,
    getPersonalBalance,
    getPersonalWalletAddress,
    checkBalance
};