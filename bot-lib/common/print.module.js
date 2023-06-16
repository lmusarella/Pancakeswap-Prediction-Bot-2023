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

const SPACE = CONSOLE_STRINGS.TEMPLATES.UTILS.SPACE;

const printSectionSeparator = () => {
    console.log(CONSOLE_STRINGS.TEMPLATES.UTILS.LOG_SECTION_SEPARATOR);
}

const printSubSectionSeparator = () => {
    console.log(CONSOLE_STRINGS.TEMPLATES.UTILS.LOG_SUB_SECTION_SEPARATOR);
}

const printEmptyRow = () => {
    console.log(CONSOLE_STRINGS.TEMPLATES.UTILS.EMPTY);
}

const printCopyRightLicense = () => {
    printSectionSeparator();
    console.log(CONSOLE_STRINGS.TEMPLATES.COPYRIGHT.FIRST_LINE);
    printEmptyRow();
    console.log(CONSOLE_STRINGS.TEMPLATES.COPYRIGHT.SECOND_LINE);
    printEmptyRow();
    console.log(CONSOLE_STRINGS.TEMPLATES.COPYRIGHT.THIRD_LINE);
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
    console.log(evalString(CONSOLE_STRINGS.INFO_MESSAGE.WAITING_NEXT_ROUND, { nextRound: currentRound + 1 }));
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
    console.log(evalString(CONSOLE_STRINGS.TEMPLATES.WELCOME_MESSAGE.FIRST_LINE, { crypto: GLOBAL_CONFIG.PCS_CRYPTO_SELECTED }));
    printEmptyRow();
    printSectionSeparator();
}

const printCurrencyInfo = () => {
    printEmptyRow();
    console.log("(", 1, getCrypto(), CONSOLE_STRINGS.EQUAL, getCryptoUsdPrice(), CONSOLE_STRINGS.USD, ")");
    if (getCrypto() != BNB_CRYPTO) {
        printEmptyRow();
        console.log("(", 1, getFeeCrypto(), CONSOLE_STRINGS.EQUAL, getCryptoFeeUsdPrice(), CONSOLE_STRINGS.USD, ")");
    }
    printEmptyRow();
    printSectionSeparator();
}

const printGlobalSettings = () => {
    console.log(CONSOLE_STRINGS.TEMPLATES.GLOBAL_SETTINGS.HEADER);
    printSubSectionSeparator();
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.GLOBAL_SETTINGS.BOT_STRATEGY, GLOBAL_CONFIG.STRATEGY_CONFIGURATION.SELECTED_STRATEGY);
    if (GLOBAL_CONFIG.STRATEGY_CONFIGURATION.SELECTED_STRATEGY === COPY_TRADING_STRATEGY) {
        console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.GLOBAL_SETTINGS.COPY_TRADE_ADDRES, GLOBAL_CONFIG.STRATEGY_CONFIGURATION.COPY_TRADING_STRATEGY.WALLET_ADDRESS_TO_EMULATE);
    }
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.GLOBAL_SETTINGS.SIMULATION_MODE, GLOBAL_CONFIG.SIMULATION_MODE ? CONSOLE_STRINGS.YES : CONSOLE_STRINGS.NO);
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.GLOBAL_SETTINGS.CLAIM_MODE, GLOBAL_CONFIG.STRATEGY_CONFIGURATION.CLAIM_REWARDS || GLOBAL_CONFIG.SIMULATION_MODE ? CONSOLE_STRINGS.YES : CONSOLE_STRINGS.NO);
    printSubSectionSeparator();
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.GLOBAL_SETTINGS.MARTINGALE, GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.ACTIVE ? CONSOLE_STRINGS.YES : CONSOLE_STRINGS.NO);
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.GLOBAL_SETTINGS.BET_AMOUNT, getBetAmount(), CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, parseFromUsdToCrypto(getBetAmount()), getCrypto());
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.GLOBAL_SETTINGS.DAILY_GOAL, GLOBAL_CONFIG.BET_CONFIGURATION.DAILY_GOAL, CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, parseFromUsdToCrypto(GLOBAL_CONFIG.BET_CONFIGURATION.DAILY_GOAL), getCrypto());
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.GLOBAL_SETTINGS.STOP_LOSS, GLOBAL_CONFIG.BET_CONFIGURATION.STOP_LOSS, CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, parseFromUsdToCrypto(GLOBAL_CONFIG.BET_CONFIGURATION.STOP_LOSS), getCrypto());
    printSectionSeparator();
}

const printWalletInfo = (balance) => {
    console.log(CONSOLE_STRINGS.TEMPLATES.WALLET_INFO.HEADER);
    printSubSectionSeparator();
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.WALLET_INFO.ADDRESS, process.env.PERSONAL_WALLET_ADDRESS);
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.WALLET_INFO.BALANCE, parseFromCryptoToUsd(balance), CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, balance, getCrypto());
    printSectionSeparator();
}

const printStartRoundEvent = (startRoundEvent, pendingRounds) => {
    console.log(evalString(CONSOLE_STRINGS.TEMPLATES.START_ROUND_EVENT.HEADER, { round: startRoundEvent.id, time: getConsoleTime() }));
    printSubSectionSeparator();
    console.log(SPACE, startRoundEvent.validProfit ? CONSOLE_STRINGS.YES : CONSOLE_STRINGS.NO, CONSOLE_STRINGS.TEMPLATES.START_ROUND_EVENT.PROFIT, fixedFloatNumber(startRoundEvent.actualProfit, USD_DECIMAL), CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, parseFromUsdToCrypto(startRoundEvent.actualProfit), getCrypto())
    console.log(SPACE, startRoundEvent.validBalance ? CONSOLE_STRINGS.YES : CONSOLE_STRINGS.NO, CONSOLE_STRINGS.TEMPLATES.START_ROUND_EVENT.BALANCE, parseFromCryptoToUsd(startRoundEvent.actualBalance), CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, fixedFloatNumber(startRoundEvent.actualBalance, CRYPTO_DECIMAL), getCrypto());
    if (startRoundEvent.errors.length) {
        startRoundEvent.errors.forEach(err => {
            console.log(SPACE, CONSOLE_STRINGS.STOP_ICON, err);
        });
    } else {
        console.log(SPACE, evalString(CONSOLE_STRINGS.INFO_MESSAGE.WAITING_STRATEGY_MESSAGE, { minutes: ((GLOBAL_CONFIG.STRATEGY_CONFIGURATION.WAITING_TIME - START_ROUND_WAITING_TIME) / 60000).toFixed(1) }));
    }
    printSectionSeparator();
    if (startRoundEvent.skipRound) {
        const rounds = Array.from(pendingRounds.values()).map(round => round.id);
        if (GLOBAL_CONFIG.BET_CONFIGURATION.MARTINGALE_CONFIG.ACTIVE && startRoundEvent.validProfit && startRoundEvent.validBalance) {
            console.log(evalString(CONSOLE_STRINGS.INFO_MESSAGE.SKIP_ROUND_MESSAGE, { round: startRoundEvent.id }));
            console.log(evalString(CONSOLE_STRINGS.INFO_MESSAGE.MARTINGALE_MODE_MESSAGE, { rounds: rounds }));
            printSectionSeparator();
        } else {
            console.log(evalString(CONSOLE_STRINGS.INFO_MESSAGE.BOT_STOPPING_MESSAGE, { rounds: rounds }));
            printSectionSeparator();
        }
    }
}

const printBetRoundEvent = (betRoundEvent) => {
    console.log(evalString(CONSOLE_STRINGS.TEMPLATES.BET_ROUND_EVENT.HEADER, { round: betRoundEvent.id, time: getConsoleTime() }));
    printSubSectionSeparator();
    if (betRoundEvent.skipRound) {
        console.log(SPACE, evalString(CONSOLE_STRINGS.INFO_MESSAGE.SKIP_MESSAGE, { message: betRoundEvent.message }));
    } else {
        console.log(SPACE, betRoundEvent.message);
        if (!betRoundEvent.betExecuted) {
            console.log(SPACE, CONSOLE_STRINGS.ERROR_MESSAGE.BET_NOT_EXECUTED);
        } else {
            console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.BET_ROUND_EVENT.BET_EXECUTED, betRoundEvent.betAmount, CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, parseFromUsdToCrypto(betRoundEvent.betAmount), getCrypto(), betRoundEvent.bet === BET_UP ? CONSOLE_STRINGS.TEMPLATES.BET_ROUND_EVENT.BET_UP : CONSOLE_STRINGS.TEMPLATES.BET_ROUND_EVENT.BET_DOWN);
        }
    }
    printSectionSeparator();
}

const printEndRoundEvent = (endRoundEvent) => {
    console.log(evalString(CONSOLE_STRINGS.TEMPLATES.END_ROUND_EVENT.HEADER, { round: endRoundEvent.id, time: getConsoleTime() }));
    printSubSectionSeparator();
    if (endRoundEvent.betTransactionError) {
        console.log(SPACE, CONSOLE_STRINGS.ERROR_MESSAGE.BET_NOT_EXECUTED);
    } else {
        console.log(SPACE, endRoundEvent.roundWon ? CONSOLE_STRINGS.TEMPLATES.END_ROUND_EVENT.WIN : CONSOLE_STRINGS.TEMPLATES.END_ROUND_EVENT.LOSS, parseFromCryptoToUsd(endRoundEvent.roundProfit, USD_DECIMAL), CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, fixedFloatNumber(endRoundEvent.roundProfit, CRYPTO_DECIMAL), getCrypto());
        console.log(SPACE, evalString(CONSOLE_STRINGS.TEMPLATES.END_ROUND_EVENT.PROFIT, { profit: fixedFloatNumber(endRoundEvent.percentageProfit, USD_DECIMAL) }));
    }
    const rewardClaimed = (GLOBAL_CONFIG.SIMULATION_MODE && endRoundEvent.roundWon) || (endRoundEvent.claimExecuted);
    console.log(SPACE, rewardClaimed ? CONSOLE_STRINGS.TEMPLATES.END_ROUND_EVENT.CLAIM_EXECUTED : endRoundEvent.claimExecuted === null ? CONSOLE_STRINGS.ERROR_MESSAGE.CLAIM_TRANSACTION_ERR : CONSOLE_STRINGS.TEMPLATES.END_ROUND_EVENT.CLAIM_NOT_EXECUTED);
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.END_ROUND_EVENT.BET_TAX, parseFeeFromCryptoToUsd(endRoundEvent.betTxGasFee, USD_DECIMAL), CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, fixedFloatNumber(endRoundEvent.betTxGasFee, CRYPTO_DECIMAL), getFeeCrypto())
    if (rewardClaimed) {
        console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.END_ROUND_EVENT.CLAIM_TAX, parseFeeFromCryptoToUsd(endRoundEvent.txClaimGasFee, USD_DECIMAL), CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, fixedFloatNumber(endRoundEvent.txClaimGasFee, CRYPTO_DECIMAL), getFeeCrypto())
    }

    printSectionSeparator();
}

const printStatistics = (statistics, roundInPending) => {
    console.log(evalString(CONSOLE_STRINGS.TEMPLATES.STATISTICS.HEADER, { executed: statistics.win + statistics.loss, betPending: roundInPending ? Array.from(roundInPending.values()).length : 0, betErrors: statistics.betErrors }));
    printSubSectionSeparator();
    console.log(SPACE, evalString(CONSOLE_STRINGS.TEMPLATES.STATISTICS.FORTUNE, { fortune: fixedFloatNumber(statistics.percentage, USD_DECIMAL) }));
    console.log(SPACE, evalString(CONSOLE_STRINGS.TEMPLATES.STATISTICS.WIN_LOSS, { win: statistics.win, loss: statistics.loss }));
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.STATISTICS.PROFIT, statistics.profit_usd, CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, fixedFloatNumber(statistics.profit_crypto, CRYPTO_DECIMAL), getCrypto(), CONSOLE_STRINGS.TEMPLATES.STATISTICS.NO_FEE);
    console.log(SPACE, CONSOLE_STRINGS.TEMPLATES.STATISTICS.FEES, statistics.totalTxGasFeeUsd, CONSOLE_STRINGS.USD, CONSOLE_STRINGS.EQUAL, fixedFloatNumber(statistics.totalTxGasFee, CRYPTO_DECIMAL), getCrypto());
    printSectionSeparator();
}

const printClaimMessage = (round, addedRewards) => {
    console.log(evalString(CONSOLE_STRINGS.INFO_MESSAGE.CLAIM_MESSAGE, { round: round, usd: parseFromCryptoToUsd(parseFloat(formatEther(addedRewards), USD_DECIMAL)), crypto: fixedFloatNumber(parseFloat(formatEther(addedRewards)), CRYPTO_DECIMAL), cryptoCurrency: getCrypto() }));
    printSectionSeparator();
}

const printFriendInactivityMessage = (round) => {
    console.log(evalString(CONSOLE_STRINGS.INFO_MESSAGE.INACTIVITY_USER_MESSAGE, { round: round, friendAddress: COPY_TRADING_STRATEGY_CONFIG.WALLET_ADDRESS_TO_EMULATE }));
    printSectionSeparator();
}

const printMostActiveUserMessage = (user, roundPlayed) => {
    console.log(evalString(CONSOLE_STRINGS.INFO_MESSAGE.MOST_ACTIVE_USER_MESSAGE, { user: user, roundPlayed: roundPlayed }));
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
    console.log(evalString(CONSOLE_STRINGS.ERROR_MESSAGE.TRANSACTION_EXE, { time: getConsoleTime(), round: formatUnit(epoch), errorCode: exception ? exception.code : 'ERROR' }), errorMessage);
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
    printCurrencyInfo,
    printGlobalSettings,
    printWalletInfo,
    printTransactionError,
    printStartRoundEvent,
    printBetRoundEvent,
    printEndRoundEvent,
    printStatistics,
    printClaimMessage,
    printFriendInactivityMessage,
    printMostActiveUserMessage,
    evalString
};
