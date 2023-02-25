/**
 * @Module 
 * @author luca.musarella
 */
const fetch = require("cross-fetch");

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