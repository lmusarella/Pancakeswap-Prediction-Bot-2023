/**
 * @Module 
 * @author luca.musarella
 */
const { TradingViewScan, SCREENERS_ENUM, EXCHANGES_ENUM, INTERVALS_ENUM } = require("trading-view-recommends-parser-nodejs");
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const SIGNALS_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.SIGNAL_STRATEGY;

//Check Signals
const getTradingSignals = async (crypto) => {
  let resultMin, resultMed;
  try {
    resultMin = await new TradingViewScan(SCREENERS_ENUM["crypto"], EXCHANGES_ENUM[SIGNALS_STRATEGY_CONFIG.DATASOURCE], `${crypto}USDT`, INTERVALS_ENUM["1m"]).analyze();
    resultMed = await new TradingViewScan(SCREENERS_ENUM["crypto"], EXCHANGES_ENUM[SIGNALS_STRATEGY_CONFIG.DATASOURCE], `${crypto}USDT`, INTERVALS_ENUM["5m"]).analyze();
  } catch (e) {
    return false;
  }
  //1 Minute signals
  const minObj = JSON.stringify(resultMin.summary);
  const minRecomendation = JSON.parse(minObj);
  //5 Minute signals
  const medObj = JSON.stringify(resultMed.summary);
  const medRecomendation = JSON.parse(medObj);
  //Average signals
  if (minRecomendation && medRecomendation) {
    const averageBuy = (parseInt(minRecomendation.BUY) + parseInt(medRecomendation.BUY)) / 2;
    const averageSell = (parseInt(minRecomendation.SELL) + parseInt(medRecomendation.SELL)) / 2;
    const averageNeutral = (parseInt(minRecomendation.NEUTRAL) + parseInt(medRecomendation.NEUTRAL)) / 2;
    return {
      buy: averageBuy,
      sell: averageSell,
      neutral: averageNeutral,
    };
  } else {
    return false;
  }
};

module.exports = {
  getTradingSignals
};
