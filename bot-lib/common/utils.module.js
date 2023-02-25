/**
 * @Module 
 * @author luca.musarella
 */
const { ethers } = require('ethers');
const fs = require('fs');
const Big = require("big.js");
const { BET_UP, BET_DOWN, CRYPTO_DECIMAL, USD_DECIMAL, BNB_CRYPTO } = require("./constants/bot.constants");
const { GLOBAL_CONFIG } = require('../../bot-configuration/bot-configuration');

//Default Config
const UTILS_LOCAL_STATE = {
  cryptoSelectdUsdPrice: 0,
  cryptoFeeUsdPrice: 0
}

const getCryptoUsdPrice = () => {
  return UTILS_LOCAL_STATE.cryptoSelectdUsdPrice;
}

const getCryptoFeeUsdPrice = () => {
  return UTILS_LOCAL_STATE.cryptoFeeUsdPrice;
}

const setCryptoFeeUsdPrice = (cryptoUsdPrice) => {
  UTILS_LOCAL_STATE.cryptoFeeUsdPrice = cryptoUsdPrice
}


const setCryptoUsdPrice = (cryptoUsdPrice) => {
  UTILS_LOCAL_STATE.cryptoSelectdUsdPrice = cryptoUsdPrice
}

const updateCryptoUsdPriceFromSmartContract = (cryptoUsdPrice) => {
  setCryptoUsdPrice(formatUnit(cryptoUsdPrice, "8"));
}

const formatEther = (amount) => {
  return ethers.utils.formatEther(amount);
};

const getCrypto = () => {
  return GLOBAL_CONFIG.PCS_CRYPTO_SELECTED;
}

const getFeeCrypto = () => {
  return BNB_CRYPTO;
}

const formatUnit = (amount, unit) => {
  return parseFloat(ethers.utils.formatUnits(amount, unit ? unit : "0"));
};

const fixedFloatNumber = (amount, fixed) => {
  return parseFloat(amount.toFixed(fixed));
};

const parseEther = (amount) => {
  return ethers.utils.parseEther(amount, 'ether');
};

const parseBetAmount = (amount) => {
  return parseEther(amount.toFixed(18).toString());
};

const parseFromUsdToCrypto = (usdPrice) => {
  return fixedFloatNumber(usdPrice / getCryptoUsdPrice(), CRYPTO_DECIMAL);
}

const parseFromCryptoToUsd = (cryptoPrice) => {
  return fixedFloatNumber(cryptoPrice * getCryptoUsdPrice(), USD_DECIMAL);
}

const parseFeeFromCryptoToUsd = (cryptoPrice) => {
  return fixedFloatNumber(cryptoPrice * getCryptoFeeUsdPrice(), USD_DECIMAL);
}

const reduceWaitingTimeByTwoBlocks = (waitingTime) => {
  if (waitingTime <= 6000) {
    return waitingTime;
  }
  return waitingTime - 6000;
};

const percentage = (a, b) => {
  return parseInt((100 * a) / (a + b));
};

const percentageChange = (a, b) => {
  return ((b - a) * 100) / a;
};

const writeOrUpdateFile = (path, jsonFileContent) => {
  fs.writeFileSync(path, JSON.stringify(jsonFileContent), "utf8");
  return jsonFileContent;
}

const getFileJsonContent = async (path) => {
  try {
    if (fs.existsSync(path)) {
      let contentJsonFile;
      try {
        contentJsonFile = JSON.parse(fs.readFileSync(path));
      } catch (e) {
        console.log("Error reading contentJsonFile:", e);
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
    winner: closePrice.gt(lockPrice) ? BET_UP : BET_DOWN
  };
}

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
  updateCryptoUsdPriceFromSmartContract
};