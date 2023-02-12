/**
 * @Module 
 * @author luca.musarella
 */

const {percentageChange, percentage} = require('./utils.module');
const {GLOBAL_CONFIG} = require("../bot-configuration/constants/bot-global.constants");
const {betDownBNB, betUpBNB, betDownCake, betUpCake} = require('../bot-modules/smart-contracts.module');
const {saveRoundInHistory, getHistory} = require('../bot-modules/history.module');
const {getTradingSignals} = require('../bot-modules/trading-signals.module');

const getStats = (historyData, cryptoPrice) => {
    let totalEarnings = 0;
    let roundEarnings = 0;
    let win = 0;
    let loss = 0;
    if (historyData && cryptoPrice) {
      for (let i = 0; i < historyData.length; i++) {
        roundEarnings = 0;
        if (historyData[i].bet && historyData[i].winner) {
          if (historyData[i].bet == historyData[i].winner) {
            win++;
            if (historyData[i].winner == "bull") {
                roundEarnings = parseFloat(historyData[i].betAmount) * parseFloat(historyData[i].bullPayout) - parseFloat(historyData[i].betAmount);
            } else if (historyData[i].winner == "bear") {
              roundEarnings = parseFloat(historyData[i].betAmount) * parseFloat(historyData[i].bearPayout) - parseFloat(historyData[i].betAmount);
            } else {
              break;
            }
            totalEarnings += roundEarnings;
          } else {
            loss++;
            totalEarnings -= parseFloat(historyData[i].betAmount);
          }
        }
      }
    }
    const percentage = -percentageChange(win + loss, loss);
    return {
      profit_USD: totalEarnings * cryptoPrice,
      profit_crypto: totalEarnings,
      percentage: (isNaN(percentage) ? 0 : percentage) + " %",
      win: win,
      loss: loss,
    };
}

const setStrategyWithSignals = async (minAcurracy, epoch, cryptoPrice, crypto) => {
    const historyData = await getHistory();
    const earnings = await getStats(historyData, cryptoPrice);
    const signals = await getTradingSignals("BINANCE", crypto);

    if (earnings.profit_USD >= GLOBAL_CONFIG.DAILY_GOAL) {
      console.log("🧞 Daily goal reached. Shuting down... ✨ ");
      process.exit();
    }
   
    if (signals) {
      if (signals.buy > signals.sell && percentage(signals.buy, signals.sell) > minAcurracy) {
        console.log(`${epoch.toString()} 🔮 Prediction: UP 🟢 ${percentage(signals.buy,signals.sell)}%`);
        await betUpStrategy(GLOBAL_CONFIG.BET_AMOUNT_USD / cryptoPrice, epoch, crypto);
        await saveRoundInHistory([{
            round: epoch.toString(),
            betAmount: (GLOBAL_CONFIG.BET_AMOUNT_USD / cryptoPrice).toString(),
            bet: "bull",
          }]);
      } else if (signals.sell > signals.buy && percentage(signals.sell, signals.buy) > minAcurracy) {
        console.log(`${epoch.toString()} 🔮 Prediction: DOWN 🔴 ${percentage(signals.sell,signals.buy)}%`);
        await betDownStrategy(GLOBAL_CONFIG.BET_AMOUNT_USD / cryptoPrice, epoch, crypto);
        await saveRoundInHistory([{
            round: epoch.toString(),
            betAmount: (GLOBAL_CONFIG.BET_AMOUNT_USD / cryptoPrice).toString(),
            bet: "bear",
          }]);
      } else {
        let lowPercentage;
        if (signals.buy > signals.sell) {
          lowPercentage = percentage(signals.buy, signals.sell);
        } else {
          lowPercentage = percentage(signals.sell, signals.buy);
        }
        console.log("Waiting for next round 🕑", lowPercentage + "%");
      }
    } else {
      console.log("Error obtaining signals");
    }
  };

const betDownStrategy = async (amount, epoch, crypto) => {
    if(crypto === 'BNB') {
        await betDownBNB(amount.toFixed(18).toString(), epoch);
    } else {
        await betDownCake(amount.toFixed(18).toString(), epoch);
    }
}

const betUpStrategy = async (amount, epoch, crypto) => {
    if(crypto === 'BNB') {
        await betUpBNB(amount.toFixed(18).toString(), epoch);
    } else {
        await betUpCake(amount.toFixed(18).toString(), epoch);
    }
}
  

module.exports = {
    getStats,
    setStrategyWithSignals
};