/**
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require('ethers');
const dotenv = require('dotenv');
const { formatEther, formatUnit } = require('../common/utils.module');
const { GLOBAL_CONFIG } = require('../../bot-configuration/bot-configuration');

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

//Set up personal wallet
const wallet = new ethers.Wallet(process.env.PERSONAL_WALLET_PRIVATE_KEY);

//Set up node (bsc chain) to interact with the smart contract
const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_NODE_PROVIDER_URL);
const signer = wallet.connect(provider);

const SIMULATION = {
  FAKE_BALANCE: GLOBAL_CONFIG.SIMULATION_BALANCE
};

/**
 * Get your BNB wallet balance
 * @async
 * @returns {number} BNB wallet balance
 */
const getBNBBalance = async () => {
  return parseFloat(formatEther(await signer.getBalance()));
}

/**
 * Get your gas price of BSC chain
 * @async
 * @returns {number} gas price
 */
const getGasPrice = async () => {
  return formatUnit(await provider.getGasPrice());
}

const updateSimulationBalance = (balance) => {
  SIMULATION.FAKE_BALANCE = balance;
}

const getSimulationBalance = () => {
  return SIMULATION.FAKE_BALANCE;
}

module.exports = {
  wallet,
  provider,
  signer,
  getBNBBalance,
  getGasPrice,
  getSimulationBalance,
  updateSimulationBalance
};