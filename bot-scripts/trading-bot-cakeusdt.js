
const {GLOBAL_CONFIG} = require("../bot-configuration/bot-configuration");
const {BINANCE_API_CAKE_USDT_URL} = require("../bot-configuration/constants/api.constants");
const {EVENTS} = require("../bot-configuration/constants/smart-contract.constants");
const {CAKE_CRYPTO, CAKE_ROUND_HISTORY_FILE_NAME, CAKE_STATISTICS_HISTORY_FILE_NAME} = require("../bot-configuration/constants/bot.constants");
const {saveRoundInHistory, parseRoundDataFromSmartContract, saveStatisticsInHistory, getNewStatistics} = require('../bot-modules/history.module');
const {getBinancePrice} = require('../bot-modules/external-data/binance.module');
const {getPersonalWalletAddress} = require('../bot-modules/wallet/wallet.module');
const {checkCakeBalance, getCakeBalance} = require('../bot-modules/smart-contracts/cake-token-smart-contract.module');
const {getRoundDataCake, cakePredictionGameSmartContract, isClaimableRoundCake, claimRewardsCake, getCakeMinBetAmount} = require('../bot-modules/smart-contracts/cake-pcs-prediction-smart-contract.module');
const {excuteStrategy, checkProfitTargetReached, betDownStrategy, betUpStrategy, isCopyTradingStrategySelected, checkTradingStrategy, checkEndRoundResult} = require('../bot-modules/trading-strategy.module');
const sleep = require("util").promisify(setTimeout);
const {formatEther} = require('../bot-modules/utils.module');

//Global Configurations
const BET_CONFIG = GLOBAL_CONFIG.BET_CONFIGURATION;
const STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION;
const COPY_TRADING_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY;

//Rounds played
const roundsEntered = {};

const initBot = async () => {
  checkTradingStrategy(CAKE_CRYPTO);
  const minBetAmount = await getCakeMinBetAmount();
  await checkCakeBalance(minBetAmount);
  console.log(`--------------------------------`);
  console.log(`🟢 Bot started`);
  console.log(`--------------------------------`);
}

initBot();

//Listener on "StartRound" event from {@cakePredictionGameSmartContract}
cakePredictionGameSmartContract.on(EVENTS.START_ROUND_EVENT, async (epoch) => {
  console.log("😍 Starting round: " + epoch.toString()); 
  await checkProfitTargetReached(CAKE_STATISTICS_HISTORY_FILE_NAME);
  if(!isCopyTradingStrategySelected()) {
    roundsEntered[epoch.toString()] = true;
    console.log("🕑 Waiting: " + (STRATEGY_CONFIG.WAITING_TIME / 60000).toFixed(1) + " minutes");
    console.log(`--------------------------------`);
    await sleep(STRATEGY_CONFIG.WAITING_TIME);
    await excuteStrategy(epoch, BET_CONFIG.BET_AMOUNT_CAKE, CAKE_CRYPTO);
  } else {
    console.log(`🕑 Waiting for ${COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE} 🟢 BetBull or 🔴 BetBear events`);
    console.log(`--------------------------------`);
  }
});

//Listener on "EndRound" event from {@cakePredictionGameSmartContract}
cakePredictionGameSmartContract.on(EVENTS.END_ROUND_EVENT, async (epoch) => {
  if(roundsEntered[epoch.toString()]) {
    console.log("⛔ Ending round: " + epoch.toString());
    const isClaimableRound = await isClaimableRoundCake(epoch);
    if(isClaimableRound && STRATEGY_CONFIG.CLAIM_REWARDS) {
      console.log(`💲 Collecting winnings...`);
      await claimRewardsCake([epoch]);
    }
    const personalWalletAddress = await getPersonalWalletAddress();   
    const personalBalance = await getCakeBalance(personalWalletAddress);
    const cakeBinancePrice = await getBinancePrice(BINANCE_API_CAKE_USDT_URL);
    const roundData = await getRoundDataCake(epoch);
    const roundsHistoryData = await saveRoundInHistory(parseRoundDataFromSmartContract(epoch, roundData), CAKE_ROUND_HISTORY_FILE_NAME);
    const statistics = await saveStatisticsInHistory(getNewStatistics(roundsHistoryData, cakeBinancePrice),  CAKE_STATISTICS_HISTORY_FILE_NAME);
    checkEndRoundResult(statistics, epoch, personalBalance, CAKE_CRYPTO, cakeBinancePrice);
  }
});

//Listener on "BetBear" event from {@cakePredictionGameSmartContract}
cakePredictionGameSmartContract.on(EVENTS.BET_BEAR_EVENT, async (sender, epoch) => {
  if(isCopyTradingStrategySelected() && sender == COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE){
      console.log(`🔮 Friend ${COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE} Prediction: DOWN 🔴 for round: ${epoch.toString()}`);
      roundsEntered[epoch.toString()] = true;                              
      await betDownStrategy(BET_CONFIG.BET_AMOUNT_CAKE, epoch, CAKE_CRYPTO);          
  }
});

//Listener on "BetBull" event from {@cakePredictionGameSmartContract}
cakePredictionGameSmartContract.on(EVENTS.BET_BULL_EVENT, async(sender, epoch) =>{       
  if(isCopyTradingStrategySelected() && sender == COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE){ 
      console.log(`🔮 Friend ${COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE} Prediction: UP 🟢 for round:  ${epoch.toString()}`);
      roundsEntered[epoch.toString()] = true;   
      await betUpStrategy(BET_CONFIG.BET_AMOUNT_CAKE, epoch, CAKE_CRYPTO);                
  }
});

//Listener on "Claim" event from {@cakePredictionGameSmartContract}
cakePredictionGameSmartContract.on(EVENTS.CLAIM_EVENT, async(sender, epoch, addedRewards) =>{  
  if(STRATEGY_CONFIG.CLAIM_REWARDS) {
    const personalWalletAddress = await getPersonalWalletAddress();     
    if(sender == personalWalletAddress){ 
        console.log(`🗿 Successful collect ${formatEther(addedRewards)} ${CAKE_CRYPTO} from round: ${epoch.toString()}`);
    }
  }
});
