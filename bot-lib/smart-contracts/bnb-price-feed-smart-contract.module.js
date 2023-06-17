/**
 * Module that defines the functions for interacting directly with the smart contracts involved, defines the functions for reading data and the functions for writing data, on the blockchain on which the smart contracts are deployed
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require('ethers');
const { signer } = require('../wallet/wallet.module');
const { ORACLE_BNB_FEED_PRICE_CLINK_ADDRESS } = require("../common/constants/smart-contract.constants");
const bnbPriceAbi = require("./json_abi/bnb_usd_price_smartcontract_abi.json");

/**
 * Initialization of ORACLE_BNB_FEED_PRICE_CLINK_ADDRESS
 * @date 4/23/2023 - 4:00:18 PM
 *
 * @type {ethers.Contract}
 */
const bnbPriceFeedSmartContract = new ethers.Contract(ORACLE_BNB_FEED_PRICE_CLINK_ADDRESS, bnbPriceAbi, signer);

/**
 * Return from ChainLink oracle the current price of BNB token
 * @async
 * @returns {number} BNB price
 */
const getOracleBnbPrice = async () => {
    const price = await bnbPriceFeedSmartContract.latestAnswer();
    return formatUnit(price, "8");
}

module.exports = {
    getOracleBnbPrice
};