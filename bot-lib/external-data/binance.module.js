/**
 * @Module 
 * @author luca.musarella
 */
 const fetch = require("cross-fetch");
const { BINANCE_API_CAKE_USDT_URL,BINANCE_API_BNB_USDT_URL } = require("../common/constants/api.constants");
const { BNB_CRYPTO } = require("../common/constants/bot.constants");
const { getCrypto } = require("../common/utils.module");

 const getBinancePrice = async () => {
     const crypto_api_url = getCrypto() === BNB_CRYPTO ? BINANCE_API_BNB_USDT_URL : BINANCE_API_CAKE_USDT_URL;
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