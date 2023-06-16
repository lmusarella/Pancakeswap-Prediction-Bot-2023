/**
 * Module that defines the functions and variables useful for initializing the Wallet, Provider, Signer and recovering the data associated with it.
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require('ethers');
const dotenv = require('dotenv');
const { formatEther, formatUnit } = require('../common/utils.module');
const { GLOBAL_CONFIG } = require('../../bot-configuration/bot-configuration');

/**
 * Dotenv library configuration, for using global configuration files (.env)
 * @date 4/25/2023 - 4:13:06 PM
 *
 * @type {DotenvConfigOutput}
 */
const result = dotenv.config();

if (result.error) {
  throw result.error;
}

/**
 * Set up personal wallet with personal private key defined in .env file
 * @date 4/25/2023 - 4:13:06 PM
 *
 * @type {ethers.Wallet}
 */
const wallet = new ethers.Wallet(process.env.PERSONAL_WALLET_PRIVATE_KEY);

/**
 * Set up node (bsc chain) to interact with the smart contract, with the url defined in .env file
 * @date 4/25/2023 - 4:13:06 PM
 *
 * @type {ethers.providers.JsonRpcProvider}
 */
const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_NODE_PROVIDER_URL);

/**
 * Set up the signer which will interact with the configured node to sign any transactions on the reference blockchain
 * @date 4/25/2023 - 4:13:06 PM
 *
 * @type {ethers.Wallet}
 */
const signer = wallet.connect(provider);

/**
 * Fake balance used in simulation mode
 * @date 4/25/2023 - 4:13:06 PM
 *
 * @type {{ FAKE_BALANCE: number; }}
 */
const SIMULATION = {
  FAKE_BALANCE: GLOBAL_CONFIG.SIMULATION_CONFIGURATION.SIMULATION_BALANCE
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

/**
 * Update new balance for simulation mode
 * @date 4/25/2023 - 4:13:06 PM
 *
 * @param {number} balance - new balance
 */
const updateSimulationBalance = (balance) => {
  SIMULATION.FAKE_BALANCE = balance;
}

/**
 * Return the current fake balance
 * @date 4/25/2023 - 4:13:06 PM
 *
 * @returns {number}
 */
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