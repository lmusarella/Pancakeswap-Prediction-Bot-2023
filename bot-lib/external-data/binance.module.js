/**
 * Module that exposes the function to query the Binance API, to retrieve the current price of a cryptocurrency
 * @Module 
 * @author luca.musarella
 */
const fetch = require("cross-fetch");

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
      throw new Error("Bad response from server");
    }
    const price = await res.json();
    return parseFloat(price.price);
  } catch (err) {
    console.error("Unable to connect to Binance API", err);
  }
};

module.exports = {
  getBinancePrice
};