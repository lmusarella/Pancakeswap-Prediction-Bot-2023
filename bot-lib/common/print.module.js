const { getCrypto, getCryptoUsdPrice, parseFromUsdToCrypto, parseFromCryptoToUsd, fixedFloatNumber } = require("./utils.module");
const {GLOBAL_CONFIG} = require("../../bot-configuration/bot-configuration");
const { BET_UP, USD_DECIMAL, CRYPTO_DECIMAL, COPY_TRADING_STRATEGY } = require("./constants/bot.constants");

const BET_CONFIG = GLOBAL_CONFIG.BET_CONFIGURATION;

const LOG_SECTION_SEPARATOR=`====================================================================`;
const LOG_SUB_SECTION_SEPARATOR = `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - `;
const SPACE = ' ';

const printSectionSeparator = () => {
    console.log(LOG_SECTION_SEPARATOR);
}

const printSubSectionSeparator = () => {
    console.log(LOG_SUB_SECTION_SEPARATOR);
}

const printEmptyRow = () => {
    console.log('');
}

const printCopyRightLicense = () => {
    printSectionSeparator();
    console.log("Copyright (c) 2023 l.musarella");
    printEmptyRow();
    console.log("Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to  permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.");
    printEmptyRow();
    console.log("THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE");
}

const printInitBotMessage = () => {
    printCopyRightLicense();
    printSectionSeparator();
    printEmptyRow();
    console.log(`🟡 BOT INITIALIZING...`);
    printEmptyRow();
    printSectionSeparator();
}

const printStartBotMessage = (currentEpoch) => {
    printEmptyRow();
    console.log(`🟢 BOT STARTED`);
    printEmptyRow();
    printSectionSeparator();
    console.log(`⏰ Waiting for next round:`, currentEpoch + 1);
    printSectionSeparator();
}

const printStopBotMessage = () => {
    printEmptyRow();
    console.log(`🔴 BOT STOPPED`);
    printEmptyRow();
    printSectionSeparator();
}

const printWelcomeMessage = () => {
    printEmptyRow();
    console.log(`🤗 WELCOME ON ${GLOBAL_CONFIG.PCS_CRYPTO_SELECTED}-USDT PREDICTION GAME BOT!`, `(`, 1, getCrypto(), "=", getCryptoUsdPrice(), "USD )");
    printEmptyRow();
    printSectionSeparator();
}

const printGlobalSettings = () => {
    console.log("⚙️ ","GLOBAL SETTINGS");
    printSubSectionSeparator();
    console.log(SPACE,`▫️ Bot Strategy:`, GLOBAL_CONFIG.SELECTED_STRATEGY);
    if(GLOBAL_CONFIG.SELECTED_STRATEGY === COPY_TRADING_STRATEGY) {
        console.log(SPACE,`▫️ Copy Target Address:`, GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY.WALLET_ADDRESS_TO_EMULATE);
    }
    console.log(SPACE,`▫️ Simulation Mode:`, GLOBAL_CONFIG.SIMULATION_MODE ? '✔️' : '❌');
    console.log(SPACE,`▫️ Auto Claim:`, GLOBAL_CONFIG.CLAIM_REWARDS ? '✔️' : '❌' );
    printSubSectionSeparator();
    console.log(SPACE,`▫️ Bet Amount:`, BET_CONFIG.BET_AMOUNT, 'USD =', parseFromUsdToCrypto(BET_CONFIG.BET_AMOUNT), getCrypto());
    console.log(SPACE,`▫️ Daily Goal:`, BET_CONFIG.DAILY_GOAL, 'USD =', parseFromUsdToCrypto(BET_CONFIG.DAILY_GOAL), getCrypto());
    console.log(SPACE,`▫️ Stop Loss:`, BET_CONFIG.STOP_LOSS, 'USD =', parseFromUsdToCrypto(BET_CONFIG.STOP_LOSS), getCrypto());
    printSectionSeparator();
}

const printWalletInfo = (balance) => {
    console.log("💻", "WALLET");
    printSubSectionSeparator();
    console.log(SPACE,`▫️ Address:`, process.env.PERSONAL_WALLET_ADDRESS);
    console.log(SPACE,`▫️ Balance:`, parseFromCryptoToUsd(balance), 'USD =', balance, getCrypto());
    printSectionSeparator();
}

const printStartRoundEvent = (startRoundEvent, pendingRounds) => {
    console.log("⚔️",SPACE, "ROUND:", startRoundEvent.id,"|", getConsoleTime() ,"| START 🎉");
    printSubSectionSeparator();  
    console.log(SPACE,startRoundEvent.validProfit ? '✔️ ': '❌', `Check Profit:`, startRoundEvent.actualProfit, 'USD =', parseFromUsdToCrypto(startRoundEvent.actualProfit), getCrypto())
    console.log(SPACE, startRoundEvent.validBalance ? '✔️ ': '❌', `Check Balance:`, parseFromCryptoToUsd(startRoundEvent.actualBalance), 'USD =', startRoundEvent.actualBalance, getCrypto());
    if(startRoundEvent.errors.length) {
        startRoundEvent.errors.forEach(err => {
            console.log(SPACE,"⛔", err);
        });
    } else {
        console.log(SPACE, "⏰", `Waiting ${(GLOBAL_CONFIG.WAITING_TIME / 60000).toFixed(1)} minutes before execute strategy`);
    }  
    printSectionSeparator();
    if(startRoundEvent.skipRound) {    
        console.log("🚨", "Bot is stopping! Waiting pending rounds:", Array.from(pendingRounds.values()).map(round => round.id));
        printSectionSeparator();
    }
}

const printBetRoundEvent = (betRoundEvent) => {
    console.log("⚔️",SPACE,"ROUND:", betRoundEvent.id,"|", getConsoleTime() ,"| BET 🎲");
    printSubSectionSeparator();
    if(betRoundEvent.skipRound){
        console.log(SPACE, `♻️  Skip: ${betRoundEvent.message}`);
    } else {
        console.log(SPACE, betRoundEvent.message);
        if(!betRoundEvent.betExecuted) {
            console.log(SPACE, `⛔ Bet not executed! Transaction Error!`);
        } else {
            console.log(SPACE, "✔️  Successful bet", betRoundEvent.betAmount, "USD =", parseFromUsdToCrypto(betRoundEvent.betAmount), getCrypto(), "to", betRoundEvent.bet === BET_UP ? `UP 🟢` : `DOWN 🔴`);
        }
    }
    printSectionSeparator();
}

const printEndRoundEvent = (endRoundEvent) => {
    console.log("⚔️",SPACE,"ROUND:",endRoundEvent.id,"|", getConsoleTime(), "| END 🏁");
    printSubSectionSeparator();
    if(endRoundEvent.betTransactionError){
        console.log(SPACE, "⛔ Bet Transaction Error", );
    } else {
        console.log(SPACE, endRoundEvent.roundWon ? '👍 Won:' : '👎 Lost:', parseFromCryptoToUsd(endRoundEvent.roundProfit, USD_DECIMAL), `USD =`, fixedFloatNumber(endRoundEvent.roundProfit, CRYPTO_DECIMAL), getCrypto());
    }
    console.log(SPACE, endRoundEvent.isClaimable && endRoundEvent.claimExecuted ? '✔️  Rewards Claimed' : endRoundEvent.claimExecuted === null ? '❌ Rewards Claimed' : '⛔ Claim Transaction Error');
    printSectionSeparator();
}

const printStatistics = (statistics, roundInPending) => {
    const betPending = roundInPending ? Array.from(roundInPending.values()).length : 0;
    console.log(`📊 | BETTING STATISTICS [`,`✔️  Executed`, statistics.win + statistics.loss,`| ⏳ Pending`, betPending, `| ⛔ Errors`, statistics.betErrors, "]");
    printSubSectionSeparator();
    console.log(SPACE,`🍀 Fortune: ${fixedFloatNumber(statistics.percentage, USD_DECIMAL)} %`);
    console.log(SPACE,`👍 ${statistics.win}|${statistics.loss} 👎 `);
    console.log(SPACE,`💰 Profit:`, fixedFloatNumber(statistics.profit_usd, USD_DECIMAL), `USD =`, fixedFloatNumber(statistics.profit_crypto, CRYPTO_DECIMAL), getCrypto());
    printSectionSeparator();
  }

const printTransactionError = (error, epoch) => {
    printSectionSeparator();
    console.log(`⛔ Round [${epoch.toString()}] Transactions Error: ${error.toString()}`);
    printSectionSeparator();
}

const getConsoleTime = () => {
    const date = new Date()
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `⌚ ${hours}:${minutes <= 9 ? "0" + minutes : minutes}`;
};

module.exports = {
    printInitBotMessage,
    printStartBotMessage,
    printStopBotMessage,
    printSectionSeparator,
    printEmptyRow,
    printWelcomeMessage,
    printGlobalSettings,
    printWalletInfo,
    printTransactionError,
    printStartRoundEvent,
    printBetRoundEvent,
    printEndRoundEvent,
    printStatistics
};