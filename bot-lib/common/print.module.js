/**
 * Module that displays the functions useful for printing on the screen/terminal, the information useful during the execution of the bot.
 * @Module 
 * @author luca.musarella
 */
const { getCrypto, getCryptoUsdPrice, parseFromUsdToCrypto, parseFromCryptoToUsd, fixedFloatNumber, formatUnit, parseFeeFromCryptoToUsd, getFeeCrypto, getCryptoFeeUsdPrice, getBetAmount, formatEther } = require("./utils.module");
const { GLOBAL_CONFIG } = require("../../bot-configuration/bot-configuration");
const { BET_UP, USD_DECIMAL, CRYPTO_DECIMAL, COPY_TRADING_STRATEGY, START_ROUND_WAITING_TIME, BNB_CRYPTO } = require("./constants/bot.constants");
const { CONSOLE_STRINGS } = require("./constants/strings.constants");
const COPY_TRADING_STRATEGY_CONFIG = GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY;

const SPACE = ' ';

const printSectionSeparator = () => {
    console.log(CONSOLE_STRINGS.TEMPLATES.UTILS.LOG_SECTION_SEPARATOR);
}

const printSubSectionSeparator = () => {
    console.log(CONSOLE_STRINGS.TEMPLATES.UTILS.LOG_SUB_SECTION_SEPARATOR);
}

const printEmptyRow = () => {
    console.log('');
}

const printCopyRightLicense = () => {
    printSectionSeparator();
    console.log(CONSOLE_STRINGS.TEMPLATES.COPYRIGHT.FIRST);
    printEmptyRow();
    console.log(CONSOLE_STRINGS.TEMPLATES.COPYRIGHT.SECOND);
    printEmptyRow();
    console.log(CONSOLE_STRINGS.TEMPLATES.COPYRIGHT.THIRD);
}

const printInitBotMessage = () => {
    printCopyRightLicense();
    printSectionSeparator();
    printEmptyRow();
    console.log(CONSOLE_STRINGS.INFO_MESSAGE.INIT_BOT);
    printEmptyRow();
    printSectionSeparator();
}

const printStartBotMessage = (currentRound) => {
    printEmptyRow();
    console.log(CONSOLE_STRINGS.INFO_MESSAGE.START_BOT);
    printEmptyRow();
    printSectionSeparator();
    console.log(CONSOLE_STRINGS.INFO_MESSAGE.WAITING_NEXT_ROUND, currentRound + 1);
    printSectionSeparator();
}

const printStopBotMessage = () => {
    printEmptyRow();
    console.log(CONSOLE_STRINGS.INFO_MESSAGE.STOP_BOT);
    printEmptyRow();
    printSectionSeparator();
}

const printWelcomeMessage = () => {
    printEmptyRow();
    console.log(evalString(CONSOLE_STRINGS.INFO_MESSAGE.WELCOME_MESSAGE, { crypto: GLOBAL_CONFIG.PCS_CRYPTO_SELECTED }));
    printEmptyRow();
    console.log( `(`, 1, getCrypto(), "=", getCryptoUsdPrice(), "USD )");
    if(getCrypto() != BNB_CRYPTO) {
        printEmptyRow();
        console.log( `(`, 1, getFeeCrypto(), "=", getCryptoFeeUsdPrice(), "USD )");
    }
    printEmptyRow();
    printSectionSeparator();
}

const printGlobalSettings = () => {
    console.log("⚙️ ", "GLOBAL SETTINGS");
    printSubSectionSeparator();
    console.log(SPACE, `▫️ Bot Strategy:`, GLOBAL_CONFIG.SELECTED_STRATEGY);
    if (GLOBAL_CONFIG.SELECTED_STRATEGY === COPY_TRADING_STRATEGY) {
        console.log(SPACE, `▫️ Copy Target Address:`, GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY.WALLET_ADDRESS_TO_EMULATE);
    }
    console.log(SPACE, `▫️ Simulation Mode:`, GLOBAL_CONFIG.SIMULATION_MODE ? '✔️' : '❌');
    console.log(SPACE, `▫️ Auto Claim:`, GLOBAL_CONFIG.CLAIM_REWARDS || GLOBAL_CONFIG.SIMULATION_MODE ? '✔️' : '❌');
    printSubSectionSeparator();
    console.log(SPACE, `▫️ Martingale:`, GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.ACTIVE ? '✔️' : '❌');
    console.log(SPACE, `▫️ Bet Amount:`, getBetAmount(), 'USD =', parseFromUsdToCrypto(getBetAmount()), getCrypto());
    console.log(SPACE, `▫️ Daily Goal:`, GLOBAL_CONFIG.BET_CONFIGURATION.DAILY_GOAL, 'USD =', parseFromUsdToCrypto(GLOBAL_CONFIG.BET_CONFIGURATION.DAILY_GOAL), getCrypto());
    console.log(SPACE, `▫️ Stop Loss:`, GLOBAL_CONFIG.BET_CONFIGURATION.STOP_LOSS, 'USD =', parseFromUsdToCrypto(GLOBAL_CONFIG.BET_CONFIGURATION.STOP_LOSS), getCrypto());
    printSectionSeparator();
}

const printWalletInfo = (balance) => {
    console.log("💻", "WALLET");
    printSubSectionSeparator();
    console.log(SPACE, `▫️ Address:`, process.env.PERSONAL_WALLET_ADDRESS);
    console.log(SPACE, `▫️ Balance:`, parseFromCryptoToUsd(balance), 'USD =', balance, getCrypto());
    printSectionSeparator();
}

const printStartRoundEvent = (startRoundEvent, pendingRounds) => {
    console.log("⚔️", SPACE, "ROUND:", startRoundEvent.id, "|", getConsoleTime(), "| START 🎉");
    printSubSectionSeparator();
    console.log(SPACE, startRoundEvent.validProfit ? '✔️ ' : '❌', `Check Profit:`, fixedFloatNumber(startRoundEvent.actualProfit, USD_DECIMAL), 'USD =', parseFromUsdToCrypto(startRoundEvent.actualProfit), getCrypto())
    console.log(SPACE, startRoundEvent.validBalance ? '✔️ ' : '❌', `Check Balance:`, parseFromCryptoToUsd(startRoundEvent.actualBalance), 'USD =', fixedFloatNumber(startRoundEvent.actualBalance, CRYPTO_DECIMAL), getCrypto());
    if (startRoundEvent.errors.length) {
        startRoundEvent.errors.forEach(err => {
            console.log(SPACE, "⛔", err);
        });
    } else {
        console.log(SPACE, "⏰", `Waiting ${((GLOBAL_CONFIG.WAITING_TIME - START_ROUND_WAITING_TIME) / 60000).toFixed(1)} minutes before execute strategy`);
    }
    printSectionSeparator();
    if (startRoundEvent.skipRound) {
        if(GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.ACTIVE && startRoundEvent.validProfit && startRoundEvent.validBalance) {
            console.log(`♻️  Skip Round:`, startRoundEvent.id);
            console.log("🚨", "Bot is running in Martingale Mode! Waiting pending rounds:", Array.from(pendingRounds.values()).map(round => round.id));
            printSectionSeparator();
        } else {
            console.log("🚨", "Bot is stopping! Waiting pending rounds:", Array.from(pendingRounds.values()).map(round => round.id));
            printSectionSeparator();
        }    
    }
}

const printBetRoundEvent = (betRoundEvent) => {
    console.log("⚔️", SPACE, "ROUND:", betRoundEvent.id, "|", getConsoleTime(), "| BET 🎲");
    printSubSectionSeparator();
    if (betRoundEvent.skipRound) {
        console.log(SPACE, `♻️  Skip: ${betRoundEvent.message}`);
    } else {
        console.log(SPACE, betRoundEvent.message);
        if (!betRoundEvent.betExecuted) {
            console.log(SPACE, `⛔ Bet not executed! Transaction Error!`);
        } else {
            console.log(SPACE, "✔️  Successful bet", betRoundEvent.betAmount, "USD =", parseFromUsdToCrypto(betRoundEvent.betAmount), getCrypto(), "to", betRoundEvent.bet === BET_UP ? `UP 🟢` : `DOWN 🔴`);
        }
    }
    printSectionSeparator();
}

const printEndRoundEvent = (endRoundEvent) => {
    console.log("⚔️", SPACE, "ROUND:", endRoundEvent.id, "|", getConsoleTime(), "| END 🏁");
    printSubSectionSeparator();
    if (endRoundEvent.betTransactionError) {
        console.log(SPACE, "⛔ Bet Transaction Error",);
    } else {
        console.log(SPACE, endRoundEvent.roundWon ? '👍 Won:' : '👎 Lost:', parseFromCryptoToUsd(endRoundEvent.roundProfit, USD_DECIMAL), `USD =`, fixedFloatNumber(endRoundEvent.roundProfit, CRYPTO_DECIMAL), getCrypto(), fixedFloatNumber(endRoundEvent.percentageProfit, USD_DECIMAL), '%');
    }
    const rewardClaimed = (GLOBAL_CONFIG.SIMULATION_MODE && endRoundEvent.roundWon) || (endRoundEvent.claimExecuted);
    console.log(SPACE, rewardClaimed ? '✔️  Rewards Claimed' : endRoundEvent.claimExecuted === null ? '⛔ Claim Transaction Error' : '❌ Rewards Claimed');
    console.log(SPACE, '⛽ Bet Tx Fee:', parseFeeFromCryptoToUsd(endRoundEvent.betTxGasFee, USD_DECIMAL), `USD =`, fixedFloatNumber(endRoundEvent.betTxGasFee, CRYPTO_DECIMAL), getFeeCrypto())
    if(rewardClaimed) {
        console.log(SPACE, '⛽ Claim Tx Fee:', parseFeeFromCryptoToUsd(endRoundEvent.txClaimGasFee, USD_DECIMAL), `USD =`, fixedFloatNumber(endRoundEvent.txClaimGasFee, CRYPTO_DECIMAL), getFeeCrypto())
    }

    printSectionSeparator();
}

const printStatistics = (statistics, roundInPending) => {
    const betPending = roundInPending ? Array.from(roundInPending.values()).length : 0;
    console.log(`📊 BETTING STATISTICS [`, `✔️  Executed`, statistics.win + statistics.loss, `| ⏳ Pending`, betPending, `| ⛔ Errors`, statistics.betErrors, "]");
    printSubSectionSeparator();
    console.log(SPACE, `🍀 Fortune: ${fixedFloatNumber(statistics.percentage, USD_DECIMAL)} %`);
    console.log(SPACE, `👍 ${statistics.win}|${statistics.loss} 👎 `);
    console.log(SPACE, `💰 Profit:`, statistics.profit_usd, `USD =`, fixedFloatNumber(statistics.profit_crypto, CRYPTO_DECIMAL), getCrypto(), '(fees excluded)');
    console.log(SPACE, `⛽ Total Fees:`, statistics.totalTxGasFeeUsd, `USD =`, fixedFloatNumber(statistics.totalTxGasFee, CRYPTO_DECIMAL), getFeeCrypto());
    printSectionSeparator();
}

const printClaimMessage = (round, addedRewards) => {
    console.log(`🗿 Round [`, round, `] Successful claimed`, parseFromCryptoToUsd(parseFloat(formatEther(addedRewards), USD_DECIMAL)), 'USD =', fixedFloatNumber(parseFloat(formatEther(addedRewards)), CRYPTO_DECIMAL), getCrypto());
    printSectionSeparator();
}

const printFriendInactivityMessage = (round) => {
    console.log(`🥺 Round [`, round, `] Sorry your friend`, [COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE], `didn't bet!`);
    printSectionSeparator();
}

const printTransactionError = (stacktrace, exception, epoch) => {
    let errorMessage;
    try {
        const exceptionBody = JSON.parse(exception.error.body);
        errorMessage = exceptionBody.error.message;
    } catch {
        errorMessage = exception ? exception : stacktrace;
    }
    console.log("⛔ Transaction Error [", getConsoleTime(),"][", formatUnit(epoch),`][ ${exception ? exception.code : 'ERROR'} ] =>`, errorMessage);
    printSectionSeparator();
}

const getConsoleTime = () => {
    const date = new Date()
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `⌚ ${hours}:${minutes <= 9 ? "0" + minutes : minutes}`;
};


const evalString = (string, object) => string.replaceAll(/\{([^}]+)\}/gi, (_, a) => a.split('.').reduce((b, c) => b?.[c], object));


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
    printStatistics,
    printClaimMessage,
    printFriendInactivityMessage,
    evalString
};
