/**
 * @Module 
 * @author luca.musarella
 */

const {TradingViewScan,SCREENERS_ENUM,EXCHANGES_ENUM,INTERVALS_ENUM} = require("trading-view-recommends-parser-nodejs");

//Check Signals
const getTradingSignals = async (exchange, crypto) => {
    //1 Minute signals
    const resultMin = await new TradingViewScan(SCREENERS_ENUM["crypto"], EXCHANGES_ENUM[exchange], `${crypto}USDT`, INTERVALS_ENUM["1m"]).analyze();
    const minObj = JSON.stringify(resultMin.summary);
    const minRecomendation = JSON.parse(minObj);
  
    //5 Minute signals
    const resultMed = await new TradingViewScan(SCREENERS_ENUM["crypto"], EXCHANGES_ENUM[exchange], `${crypto}USDT`, INTERVALS_ENUM["5m"]).analyze();
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
