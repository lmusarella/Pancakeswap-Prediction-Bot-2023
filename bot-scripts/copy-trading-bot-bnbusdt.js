
const {GLOBAL_CONFIG} = require("../bot-configuration/constants/bot-global.constants");
const {BINANCE_API_BNB_USDT_URL} = require("../bot-configuration/constants/api.constants");
const {checkBalance} = require('../bot-modules/wallet.module');
const {bnbPredictionGameSmartContract, betDownBNB, betUpBNB, getRoundDataBNB} = require('../bot-modules/smart-contracts.module');
const {saveRoundInHistory, parseRoundDataFromSmartContract} = require('../bot-modules/history.module');
const {getBinancePrice} = require('../bot-modules/binance.module');
const {getStats} = require('../bot-modules/trading-strategy.module');
const roundPlayed = {};

checkBalance(GLOBAL_CONFIG.MIN_BNB_BET_AMOUNT);
console.log(`🤗 Welcome on BNB Prediction Game! 🕑 Waiting for ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} next round...`);

bnbPredictionGameSmartContract.on("BetBear",async (sender, epoch) => {
    if(sender == GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE){
        console.log(`${epoch.toString()} 🔮 Friend ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} Prediction: DOWN 🔴`);
        roundPlayed[epoch] = true;
        try{               
            const betAmount = GLOBAL_CONFIG.BET_AMOUNT_BNB.toFixed(18).toString();                 
            await betDownBNB(betAmount, epoch);
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

bnbPredictionGameSmartContract.on("BetBull", async(sender, epoch) =>{       
    if(sender == GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE){ 
        console.log(`${epoch.toString()} 🔮 Friend ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} Prediction: UP 🟢`);   
        roundPlayed[epoch] = true;
        try{                           
            const betAmount = GLOBAL_CONFIG.BET_AMOUNT_BNB.toFixed(18).toString();
            await betUpBNB(betAmount, epoch);
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

bnbPredictionGameSmartContract.on("StartRound", async (epoch) => {
    console.log("😍 Starting round " + epoch.toString());
    console.log(`🕑 Waiting for ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} 🟢 BetBull or 🔴 BetBear actions`);
});

bnbPredictionGameSmartContract.on("EndRound", async (epoch) => {
    console.log("⛔ Ending round " + epoch.toString());
    if(roundPlayed[epoch]) {
        const roundData = await getRoundDataBNB(epoch);
        const historyData = await saveRoundInHistory(parseRoundDataFromSmartContract(epoch, roundData));
        const bnbBinancePrice = await getBinancePrice(BINANCE_API_BNB_USDT_URL);
        const stats = getStats(historyData, bnbBinancePrice);
        console.log("--------------------------------");
        console.log(`🍀 Fortune: ${stats.percentage}`);
        console.log(`👍 ${stats.win}|${stats.loss} 👎 `);
        console.log(`💰 Profit: ${stats.profit_USD.toFixed(3)} USD`);
        console.log("--------------------------------");
    } else {
        console.log(`😞 I'm sorry but your friend ${GLOBAL_CONFIG.WALLET_ADDRESS_TO_EMULATE} didn't bet this round!`);
    }
});


    