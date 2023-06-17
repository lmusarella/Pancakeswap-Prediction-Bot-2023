/**
 * Module that defines the functions for interacting directly with the smart contracts involved, defines the functions for reading data and the functions for writing data, on the blockchain on which the smart contracts are deployed
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require('ethers');
const { signer } = require('../wallet/wallet.module');
const { ORACLE_CAKE_FEED_PRICE_CLINK_ADDRESS } = require("../common/constants/smart-contract.constants");
const cakePriceAbi = require("./json_abi/cake_usd_price_smartcontract_abi.json");
const { formatUnit } = require('../common/utils.module');

/**
 * Initialization of ORACLE_CAKE_FEED_PRICE_CLINK_ADDRESS
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @type {ethers.Contract}
 */
const cakePriceFeedSmartContract = new ethers.Contract(ORACLE_CAKE_FEED_PRICE_CLINK_ADDRESS, cakePriceAbi, signer);

/**
 * Return from ChainLink oracle the current price of Cake token
 * @async
 * @returns {number} CAKE current price
 */
const getOracleCakePrice = async () => {
    const price = await cakePriceFeedSmartContract.latestAnswer();
    return formatUnit(price, "8");
}

module.exports = {
    getOracleCakePrice
};