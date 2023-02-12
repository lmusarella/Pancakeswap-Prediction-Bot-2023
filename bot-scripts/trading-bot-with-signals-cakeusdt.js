
const {GLOBAL_CONFIG} = require("../bot-configuration/constants/bot-global.constants");
const {BINANCE_API_CAKE_USDT_URL} = require("../bot-configuration/constants/api.constants");
const {saveRoundInHistory, parseRoundDataFromSmartContract} = require('../bot-modules/history.module');
const {getBinancePrice} = require('../bot-modules/binance.module');
const {getRoundDataCake, cakePredictionGameSmartContract} = require('../bot-modules/smart-contracts.module');
const {setStrategyWithSignals, getStats} = require('../bot-modules/trading-strategy.module');
const {checkBalance} = require('../bot-modules/wallet.module');
const sleep = require("util").promisify(setTimeout);

//Check balance
checkBalance(GLOBAL_CONFIG.MIN_CAKE_BET_AMOUNT);
console.log("🤗 Welcome on Cake Prediction Game! 🕑 Waiting for next round...");

//Betting
cakePredictionGameSmartContract.on("StartRound", async (epoch) => {
  console.log("😍 Starting round " + epoch.toString());
  console.log("🕑 Waiting " + (GLOBAL_CONFIG.WAITING_TIME / 60000).toFixed(1) + " minutes");
  await sleep(GLOBAL_CONFIG.WAITING_TIME);
  const cakeBinancePrice = await getBinancePrice(BINANCE_API_CAKE_USDT_URL);
  await setStrategyWithSignals(GLOBAL_CONFIG.THRESHOLD, epoch, cakeBinancePrice, "CAKE");
});

//Show stats
cakePredictionGameSmartContract.on("EndRound", async (epoch) => {
  console.log("⛔ Ending round " + epoch.toString());
  const roundData = await getRoundDataCake(epoch);
  const historyData = await saveRoundInHistory(parseRoundDataFromSmartContract(epoch, roundData))
  const cakeBinancePrice = await getBinancePrice(BINANCE_API_CAKE_USDT_URL);
  const stats = getStats(historyData, cakeBinancePrice);
  console.log("--------------------------------");
  console.log(`🍀 Fortune: ${stats.percentage}`);
  console.log(`👍 ${stats.win}|${stats.loss} 👎 `);
  console.log(`💰 Profit: ${stats.profit_USD.toFixed(3)} USD`);
  console.log("--------------------------------");
});
