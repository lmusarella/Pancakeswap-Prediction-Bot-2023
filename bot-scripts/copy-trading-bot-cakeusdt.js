
const {GLOBAL_CONFIG} = require("../bot-configuration/constants/bot-global.constants");
const {BINANCE_API_CAKE_USDT_URL} = require("../bot-configuration/constants/api.constants");
const {cakePredictionGameSmartContract, betDownCake, betUpCake, getRoundDataCake, checkCakeBalance} = require('../bot-modules/smart-contracts.module');
const {saveRoundInHistory, parseRoundDataFromSmartContract} = require('../bot-modules/history.module');
const {getBinancePrice} = require('../bot-modules/binance.module');
const {getStats} = require('../bot-modules/trading-strategy.module');
const roundPlayed = {};

//Check balance
checkCakeBalance(GLOBAL_CONFIG.MIN_CAKE_BET_AMOUNT);
console.log(`🤗 Welcome on Cake Prediction Game! 🕑 Waiting for ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} next round...`);

cakePredictionGameSmartContract.on("BetBear",async (sender, epoch) => {
    if(sender == GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE){
        console.log(`${epoch.toString()} 🔮 Friend ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} Prediction: DOWN 🔴`);
        roundPlayed[epoch] = true;
        try{               
            const betAmount = GLOBAL_CONFIG.BET_AMOUNT_CAKE.toFixed(18).toString();                 
            await betDownCake(betAmount, epoch);
            await saveRoundInHistory([{
                round: epoch.toString(),
                betAmount: betAmount,
                bet: "bear",
            }]);  
        } catch (err){             
            console.log(err);
        }               
    }
});

cakePredictionGameSmartContract.on("BetBull", async(sender, epoch) =>{       
    if(sender == GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE){ 
        console.log(`${epoch.toString()} 🔮 Friend ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} Prediction: UP 🟢`);   
        roundPlayed[epoch] = true;
        try{                           
            const betAmount = GLOBAL_CONFIG.BET_AMOUNT_CAKE.toFixed(18).toString();
            await betUpCake(betAmount, epoch);
            await saveRoundInHistory([{
                round: epoch.toString(),
                betAmount: betAmount,
                bet: "bull",
            }]);     
        } catch (err){             
            console.log(err);
        }               
    }
});

cakePredictionGameSmartContract.on("StartRound", async (epoch) => {
    console.log("😍 Starting round " + epoch.toString());
    console.log(`🕑 Waiting for ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} 🟢 BetBull or 🔴 BetBear actions`);
});

cakePredictionGameSmartContract.on("EndRound", async (epoch) => {
    console.log("⛔ Ending round " + epoch.toString());
    if(roundPlayed[epoch]) {
        const roundData = await getRoundDataCake(epoch);
        const historyData = await saveRoundInHistory(parseRoundDataFromSmartContract(epoch, roundData));
        const cakeBinancePrice = await getBinancePrice(BINANCE_API_CAKE_USDT_URL);
        const stats = getStats(historyData, cakeBinancePrice);
        console.log("--------------------------------");
        console.log(`🍀 Fortune: ${stats.percentage}`);
        console.log(`👍 ${stats.win}|${stats.loss} 👎 `);
        console.log(`💰 Profit: ${stats.profit_USD.toFixed(3)} USD`);
        console.log("--------------------------------");
    } else {
        console.log(`😞 I'm sorry but your friend ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} didn't bet this round!`);
    }
});


    