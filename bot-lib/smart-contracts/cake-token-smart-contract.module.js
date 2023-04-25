/**
 * Module that defines the functions for interacting directly with the smart contracts involved, defines the functions for reading data and the functions for writing data, on the blockchain on which the smart contracts are deployed
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require('ethers');
const { signer } = require('../wallet/wallet.module');
const { CAKE_TOKEN_SMARTCONTRACT_ADDRESS } = require("../common/constants/smart-contract.constants");
const { formatEther } = require('../common/utils.module');
const cakeTokenAbi = require("./json_abi/cake_smartcontract_abi.json");

/**
 * Initialization of CAKE_TOKEN_SMARTCONTRACT
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @type {ethers.Contract}
 */
const cakeTokenSmartContract = new ethers.Contract(CAKE_TOKEN_SMARTCONTRACT_ADDRESS, cakeTokenAbi, signer);

/**
 * Return personal address's cake balance
 * @async
 * @returns {number} Wallet address cake balance
 */
const getCakeBalance = async () => {
    return parseFloat(formatEther(await cakeTokenSmartContract.balanceOf(process.env.PERSONAL_WALLET_ADDRESS)));
}

module.exports = {
    getCakeBalance
};