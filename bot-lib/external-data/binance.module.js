/**
 * Module that exposes the function to query the Binance API, to retrieve the current price of a cryptocurrency
 * @Module 
 * @author luca.musarella
 */
const fetch = require("cross-fetch");
const { CONSOLE_STRINGS } = require("../common/constants/strings.constants");

/**
 * Try to connect to the binance APIs, fetch the data and return the current price of the incoming cryptocurrency.
 * @date 4/25/2023 - 3:26:59 PM
 *
 * @async
 * @param {String} crypto_api_url
 * @returns {Number}
 */
const getBinancePrice = async (crypto_api_url) => {
  try {
    const res = await fetch(crypto_api_url);
    if (res.status >= 400) {
      throw new Error(CONSOLE_STRINGS.ERROR_MESSAGE.BAD_REPONSE_API);
    }
    const price = await res.json();
    return parseFloat(price.price);
  } catch (err) {
    console.error(CONSOLE_STRINGS.ERROR_MESSAGE.NO_CONNECTION_BINANCE_API, err);
  }
};

module.exports = {
  getBinancePrice
};