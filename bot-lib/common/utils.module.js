/**
 * Module that exposes the conversion, calculation and utility functions, shared on all modules
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require('ethers');
const fs = require('fs');
const Big = require("big.js");
const { BET_UP, BET_DOWN, CRYPTO_DECIMAL, USD_DECIMAL, BNB_CRYPTO } = require("./constants/bot.constants");
const { GLOBAL_CONFIG } = require('../../bot-configuration/bot-configuration');
const { CONSOLE_STRINGS } = require('./constants/strings.constants');

/**
 * Util local state
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @type {{ cryptoSelectdUsdPrice: number; cryptoFeeUsdPrice: number; betAmount: Number; }}
 */
const UTILS_LOCAL_STATE = {
  cryptoSelectdUsdPrice: 1,
  cryptoFeeUsdPrice: 1,
  betAmount: GLOBAL_CONFIG.BET_CONFIGURATION.BET_AMOUNT
}

/**
 * Return the current crypto price
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @returns {number}
 */
const getCryptoUsdPrice = () => {
  return UTILS_LOCAL_STATE.cryptoSelectdUsdPrice;
}

/**
 * Return the current crypto price of the native blockchain (BNB)
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @returns {number}
 */
const getCryptoFeeUsdPrice = () => {
  return UTILS_LOCAL_STATE.cryptoFeeUsdPrice;
}

/**
 * Return the current Bet Amount
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @returns {number}
 */
const getBetAmount = () => {
  return UTILS_LOCAL_STATE.betAmount;
}

/**
 * Update the new bet amount to use
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} betAmount - new bet amount
 */
const setBetAmount = (betAmount) => {
  UTILS_LOCAL_STATE.betAmount = betAmount
}

/**
 * Update the new crypto price to use
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} cryptoUsdPrice - new price
 */
const setCryptoFeeUsdPrice = (cryptoUsdPrice) => {
  UTILS_LOCAL_STATE.cryptoFeeUsdPrice = cryptoUsdPrice
}


/**
 * Update the new crypto price to use
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} cryptoUsdPrice  - new price
 */
const setCryptoUsdPrice = (cryptoUsdPrice) => {
  UTILS_LOCAL_STATE.cryptoSelectdUsdPrice = cryptoUsdPrice
}

/**
 * Update the new crypto price to use - from smart contract event data
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {ethers.BigNumber} cryptoUsdPrice  - new price
 */
const updateCryptoUsdPriceFromSmartContract = (cryptoUsdPrice) => {
  setCryptoUsdPrice(formatUnit(cryptoUsdPrice, "8"));
}

/**
 * inherit
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {ethers.BigNumber} amount
 * @returns {String}
 */
const formatEther = (amount) => {
  return ethers.utils.formatEther(amount);
};

/**
 * Return the crypto GAME selected
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @returns {String}
 */
const getCrypto = () => {
  return GLOBAL_CONFIG.PCS_CRYPTO_SELECTED;
}

/**
 * Return the native crypto of the blockchain (BNB)
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @returns {String}
 */
const getFeeCrypto = () => {
  return BNB_CRYPTO;
}

/**
 * inherit
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {ethers.BigNumber} amount
 * @param {string} unit
 * @returns {number}
 */
const formatUnit = (amount, unit) => {
  return parseFloat(ethers.utils.formatUnits(amount, unit ? unit : "0"));
};

/**
 * inherit
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} amount
 * @param {number} fixed
 * @returns {number}
 */
const fixedFloatNumber = (amount, fixed) => {
  return parseFloat(amount.toFixed(fixed));
};

/**
 * inherit
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {string} amount
 * @returns {ethers.BigNumber}
 */
const parseEther = (amount) => {
  return ethers.utils.parseEther(amount, 'ether');
};

/**
 * inherit
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} amount
 * @returns {ethers.BigNumber}
 */
const parseBetAmount = (amount) => {
  return parseEther(amount.toFixed(18).toString());
};

/**
 * Convert USD to CRYPTO
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} usdPrice
 * @returns {number}
 */
const parseFromUsdToCrypto = (usdPrice) => {
  return fixedFloatNumber(usdPrice / getCryptoUsdPrice(), CRYPTO_DECIMAL);
}

/**
 * Convert CRYPTO yo USD
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} cryptoPrice
 * @returns {number}
 */
const parseFromCryptoToUsd = (cryptoPrice) => {
  return fixedFloatNumber(cryptoPrice * getCryptoUsdPrice(), USD_DECIMAL);
}

/**
 * Convert NATIVE CRYPTO yo USD
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} cryptoPrice
 * @returns {number}
 */
const parseFeeFromCryptoToUsd = (cryptoPrice) => {
  return fixedFloatNumber(cryptoPrice * getCryptoFeeUsdPrice(), USD_DECIMAL);
}

/**
 * Reduce waiting time of 6 seconds
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} waitingTime
 * @returns {number}
 */
const reduceWaitingTimeByTwoBlocks = (waitingTime) => {
  if (waitingTime <= 6000) {
    return waitingTime;
  }
  return waitingTime - 6000;
};

/**
 * inherit
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
const percentage = (a, b) => {
  return parseInt((100 * a) / (a + b));
};

/**
 * inherit
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
const percentageChange = (a, b) => {
  return ((b - a) * 100) / a;
};

/**
 * Write a file with jsonFileContent in the path
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {String} path
 * @param {any} jsonFileContent
 * @returns {any}
 */
const writeOrUpdateFile = (path, jsonFileContent) => {
  fs.writeFileSync(path, JSON.stringify(jsonFileContent, null, "\t"), "utf8");
  return jsonFileContent;
}

/**
 * Create a folder
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {String} dir
 */
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    return true;
  } else {
    return false;
  }
}

/**
 * Delete a specific file
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {String} dir
 */
const deleteFile = (path) => {
  fs.unlink(path, function(){});  
}

/**
 * Check if a round is burn or cancelled
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {String} dir
 */
const checkCancelledRound = (currentRound, stackRound) => {
   return currentRound - stackRound >= GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.NUM_ROUNDS_AFTER_DELETE_PENDING_ROUNDS;  
}

/**
 * Return the file content
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @async
 * @param {String} path
 * @returns {any} - file content
 */
const getFileJsonContent = async (path) => {
  try {
    if (fs.existsSync(path)) {
      let contentJsonFile;
      try {
        contentJsonFile = JSON.parse(fs.readFileSync(path));
      } catch (e) {
        console.log(CONSOLE_STRINGS.ERROR_MESSAGE.ERROR_PARSE_JSON_FILE, e);
        return;
      }
      return contentJsonFile;
    } else {
      return;
    }
  } catch (err) {
    console.error(err);
  }
};

/**
 * Parse and handle the round data from smart contract and wrap into a readable object
 * @date 4/25/2023 - 3:36:11 PM
 *
 * @param {ethers.BigNumber} round
 * @param {any} data -  round data from smart contract
 * @returns {{ round: number; openPrice: number; closePrice: number; bullAmount: number; bearAmount: number; bullPayout: number; bearPayout: number; validQuotes: boolean; winner: string; }}
 */
const parseRoundDataFromSmartContract = (round, data) => {
  const closePrice = data.closePrice;
  const lockPrice = data.lockPrice;
  const bullAmount = data.bullAmount;
  const bearAmount = data.bearAmount;
  const totalAmount = new Big(data.totalAmount);
  let bullPayout, bearPayout = 0;
  let validQuotes = true;
  try {
    bullPayout = parseFloat(totalAmount.div(bullAmount).round(3).toString());
    bearPayout = parseFloat(totalAmount.div(bearAmount).round(3).toString());
  } catch (_e) {
    validQuotes = false;
  }
  return {
    round: formatUnit(round),
    openPrice: formatUnit(data.lockPrice, "8"),
    closePrice: formatUnit(data.closePrice, "8"),
    bullAmount: formatUnit(data.bullAmount, "18"),
    bearAmount: formatUnit(data.bearAmount, "18"),
    bullPayout: bullPayout,
    bearPayout: bearPayout,
    validQuotes: validQuotes,
    totalAmount: formatUnit(data.totalAmount, "18"),
    winner: closePrice.gt(lockPrice) ? BET_UP : BET_DOWN
  };
}

const getStringDate = () => {
  const date = new Date()
  return `${date.getTime()}`;
};

module.exports = {
  formatEther,
  parseEther,
  getCrypto,
  getFeeCrypto,
  formatUnit,
  reduceWaitingTimeByTwoBlocks,
  percentage,
  percentageChange,
  writeOrUpdateFile,
  createDir,
  getFileJsonContent,
  parseBetAmount,
  fixedFloatNumber,
  parseRoundDataFromSmartContract,
  parseFromUsdToCrypto,
  parseFromCryptoToUsd,
  parseFeeFromCryptoToUsd,
  getCryptoUsdPrice,
  setCryptoUsdPrice,
  getCryptoFeeUsdPrice,
  setCryptoFeeUsdPrice,
  updateCryptoUsdPriceFromSmartContract,
  getBetAmount,
  setBetAmount,
  getStringDate,
  deleteFile,
  checkCancelledRound
};