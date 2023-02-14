/**
 * @Module 
 * @author luca.musarella
 */
const {percentage, stopBotCommand} = require('./utils.module');
const {GLOBAL_CONFIG} = require("../bot-configuration/bot-configuration");
const {BET_DOWN, BET_UP, BNB_CRYPTO} = require("../bot-configuration/constants/bot.constants");
const {betDownCake, betUpCake, getRoundDataCake} = require('../bot-modules/smart-contracts/cake-pcs-prediction-smart-contract.module');
const {betDownBNB, betUpBNB, getRoundDataBNB} = require('../bot-modules/smart-contracts/bnb-pcs-prediction-smart-contract.module');
const {saveRoundInHistory, getStatisticFromHistory, parseRoundDataFromSmartContract} = require('../bot-modules/history.module');
const {getTradingSignals} = require('../bot-modules/external-data/trading-signals.module');

const BET_CONFIG = GLOBAL_CONFIG.BET_CONFIGURATION;
const STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION;
const SIGNALS_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.SIGNAL_STRATEGY;
const QUOTE_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.QUOTE_STRATEGY;

const excuteStrategy = async (epoch, betAmount, crypto) => {
    if(isSignalStrategySelected()) {
      await executeStrategyWithSignals(epoch, betAmount, crypto);
    } else if(isQuoteStrategySelected()) {
      await executeStrategyWithQuotes(epoch, betAmount, crypto);
    }
}

const executeStrategyWithQuotes = async (epoch, betAmount, crypto) => {
  const roundData = crypto == BNB_CRYPTO ? await getRoundDataBNB(epoch) : await getRoundDataCake(epoch)
  const parsedRoundData = parseRoundDataFromSmartContract(epoch, roundData)[0];
  const bullPayout = parseFloat(parsedRoundData.bullPayout);
  const bearPayout = parseFloat(parsedRoundData.bearPayout);
  console.log(`⬆️  BullPayout ${bullPayout}x - ⬇️  BearPayout ${bearPayout}x for Round: ${epoch.toString()}`);   
  if(QUOTE_STRATEGY_CONFIG.SELECT_LOWER_QUOTE) {
    bullPayout > bearPayout ? betDownStrategy(betAmount, epoch, crypto) : betUpStrategy(betAmount, epoch, crypto);
  } else {
    bullPayout > bearPayout ? betUpStrategy(betAmount, epoch, crypto) : betDownStrategy(betAmount, epoch, crypto);
  }
};

const executeStrategyWithSignals = async (epoch, betAmount, crypto) => {
    const signals = await getTradingSignals(SIGNALS_STRATEGY_CONFIG.DATASOURCE, crypto);
    if(!signals) {
      console.log("Error obtaining signals");
      return;
    }
    if (checkSignalsUpPrediction(signals)) {
        console.log(`🔮 Signal Prediction: UP 🟢 ${percentage(signals.buy, signals.sell)}% for round: ${epoch.toString()}`);   
        await betUpStrategy(betAmount, epoch, crypto);
    } else if (checkSignalsDownPrediction(signals)) {
        console.log(`🔮 Signal Prediction: DOWN 🔴 ${percentage(signals.sell, signals.buy)}% for round: ${epoch.toString()} `);
        await betDownStrategy(betAmount, epoch, crypto);
    } else {
        skipRound(signals, epoch);
    }
};

const checkSignalsUpPrediction = (signals) => {
    return signals.buy > signals.sell && percentage(signals.buy, signals.sell) > SIGNALS_STRATEGY_CONFIG.THRESHOLD;
}

const checkSignalsDownPrediction = (signals) => {
    return signals.sell > signals.buy && percentage(signals.sell, signals.buy) > SIGNALS_STRATEGY_CONFIG.THRESHOLD;
}

const betDownStrategy = async (amount, epoch, crypto) => {
      if(crypto === BNB_CRYPTO) {
          await betDownBNB(amount.toFixed(18).toString(), epoch);
      } else {
          await betDownCake(amount.toFixed(18).toString(), epoch);
      }
    await saveRoundInHistory([{round: epoch.toString(), betAmount: amount.toString(), bet: BET_DOWN}], `rounds-${crypto}-history`);
}

const betUpStrategy = async (amount, epoch, crypto) => {
      if(crypto === BNB_CRYPTO) {
          await betUpBNB(amount.toFixed(18).toString(), epoch);
      } else {
          await betUpCake(amount.toFixed(18).toString(), epoch);
      }
    await saveRoundInHistory([{round: epoch.toString(), betAmount: amount.toString(), bet: BET_UP}], `rounds-${crypto}-history`);
}

const skipRound = (signals, epoch) => {
    let lowPercentage;
    if (signals.buy > signals.sell) {
      lowPercentage = percentage(signals.buy, signals.sell);
    } else {
       lowPercentage = percentage(signals.sell, signals.buy);
    }
    console.log(`♻️ Skip round: ${epoch} Waiting for next round 🕑`, lowPercentage + "%");
}

const checkProfitTargetReached = async (fileNameStatisticHistory) => {
  const statisticHistoryData = await getStatisticFromHistory(fileNameStatisticHistory);
  if(!statisticHistoryData) {
    return;
  }
  if (statisticHistoryData.profit_usd >= BET_CONFIG.DAILY_GOAL) {
    console.log("🧞 Daily goal reached. Shuting down... ✨ ");
    stopBotCommand();
  } else {
    console.log(`📈 Actual profit from history: ${statisticHistoryData.profit_usd} USD`);
    console.log(`👷 Daily goal not reached. Bot keep betting... 🚀 `);
  }
}

const checkStopLossTargetReached = async (statistics) => {
  if (statistics.balance_usd <= BET_CONFIG.STOP_LOSS) {
    console.log("⚠️ Stop loss reached. Shuting down... ✨ ");
    stopBotCommand();
  }
}

const checkTradingStrategy = (cripto) => {
  console.log(`--------------------------------`);
  console.log(`🤗 Welcome on ${cripto} Prediction Game!`);
  console.log(`--------------------------------`);
  console.log(`⚙️ Global Settings`);
  console.log(`📈 Bot Strategy:`, STRATEGY_CONFIG.SELECTED_STRATEGY);
  console.log(`🎬 Simulation Mode Active:`, STRATEGY_CONFIG.SIMULATION_MODE);
  console.log(`💸 Automatic Rewards Claim Active:`, STRATEGY_CONFIG.CLAIM_REWARDS);
  console.log(`⚡ Bet amount:`, cripto == BNB_CRYPTO ? BET_CONFIG.BET_AMOUNT_BNB : BET_CONFIG.BET_AMOUNT_CAKE, `${cripto}`);
  console.log(`📅 Daily goal:`, BET_CONFIG.DAILY_GOAL, 'USD');
  console.log(`🛑 Stop Loss:`, BET_CONFIG.STOP_LOSS, 'USD');
  console.log(`--------------------------------`);

  if(!isCopyTradingStrategySelected() && !isQuoteStrategySelected() && !isSignalStrategySelected()) {
    console.log(`⚠️ No strategy selected! Shuting down... ✨`);
    stopBotCommand();
  }
  
  console.log(`🟡 Bot initializing...`);
  console.log(`--------------------------------`);
}


const checkEndRoundResult = (statistics, epoch, totalBalanceCripto, crypto, cryptoUSDPrice) => {
    
  statistics.cryptoBalance = (STRATEGY_CONFIG.SIMULATION_MODE ? (STRATEGY_CONFIG.SIMULATION_BALANCE + statistics.profit_crypto) : parseFloat(formatEther(totalBalanceCripto)));
  statistics.usdBalance = statistics.cryptoBalance * cryptoUSDPrice;

  console.log("--------------------------------");
  console.log(`🍀 Fortune: ${statistics.percentage}`);
  console.log(`👍 ${statistics.win}|${statistics.loss} 👎 `);
  console.log(`💰 Profit: ${statistics.profit_usd.toFixed(3)} USD - (fees excluded)`);
  console.log(`💲 Wallet Balance: ${statistics.usdBalance.toFixed(3)} USD / ${statistics.cryptoBalance} ${crypto}`);
  console.log(`🕑 Last round: ${epoch.toString()}`);
  console.log("--------------------------------");

  checkStopLossTargetReached(statistics);
}

const isCopyTradingStrategySelected = () => {
  return STRATEGY_CONFIG.SELECTED_STRATEGY == 'COPY_TRADING_STRATEGY';
};

const isSignalStrategySelected = () => {
  return STRATEGY_CONFIG.SELECTED_STRATEGY == 'SIGNAL_STRATEGY';
};

const isQuoteStrategySelected = () => {
  return STRATEGY_CONFIG.SELECTED_STRATEGY == 'QUOTE_STRATEGY';
};
  
module.exports = {
    excuteStrategy,
    checkProfitTargetReached,
    betDownStrategy,
    betUpStrategy,
    checkTradingStrategy,
    isCopyTradingStrategySelected,
    isSignalStrategySelected,
    isQuoteStrategySelected,
    checkEndRoundResult
};