
const {GLOBAL_CONFIG} = require("../bot-configuration/constants/bot-global.constants");
const {BINANCE_API_BNB_USDT_URL} = require("../bot-configuration/constants/api.constants");
const {saveRoundInHistory, parseRoundDataFromSmartContract} = require('../bot-modules/history.module');
const {getBinancePrice} = require('../bot-modules/binance.module');
const {getRoundDataBNB, bnbPredictionGameSmartContract} = require('../bot-modules/smart-contracts.module');
const {setStrategyWithSignals, getStats} = require('../bot-modules/trading-strategy.module');
const {checkBalance} = require('../bot-modules/wallet.module');
const sleep = require("util").promisify(setTimeout);

//Check balance
checkBalance(GLOBAL_CONFIG.MIN_BNB_BET_AMOUNT);
console.log("🤗 Welcome on BNB Prediction Game! 🕑 Waiting for next round...");

//Betting
bnbPredictionGameSmartContract.on("StartRound", async (epoch) => {
  console.log("😍 Starting round " + epoch.toString());
  console.log("🕑 Waiting " + (GLOBAL_CONFIG.WAITING_TIME / 60000).toFixed(1) + " minutes");
  await sleep(GLOBAL_CONFIG.WAITING_TIME);
  const bnbBinancePrice = await getBinancePrice(BINANCE_API_BNB_USDT_URL);
  await setStrategyWithSignals(GLOBAL_CONFIG.THRESHOLD, epoch, bnbBinancePrice, "BNB");
});

//Show stats
bnbPredictionGameSmartContract.on("EndRound", async (epoch) => {
  console.log("⛔ Ending round " + epoch.toString());
  const roundData = await getRoundDataBNB(epoch);
  const historyData = await saveRoundInHistory(parseRoundDataFromSmartContract(epoch, roundData));
  const bnbBinancePrice = await getBinancePrice(BINANCE_API_BNB_USDT_URL);
  const stats = getStats(historyData, bnbBinancePrice);
  console.log("--------------------------------");
  console.log(`🍀 Fortune: ${stats.percentage}`);
  console.log(`👍 ${stats.win}|${stats.loss} 👎 `);
  console.log(`💰 Profit: ${stats.profit_USD.toFixed(3)} USD`);
  console.log("--------------------------------");
});
