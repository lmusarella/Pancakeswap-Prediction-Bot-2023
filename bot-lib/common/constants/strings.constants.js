const CONSOLE_STRINGS = {
    ERROR_MESSAGE: {
        STOP_LOSS_GOAL: "Stop Loss or Daily Goal reached!",
        BALANCE_NOT_ENOUGH: "Your balance is not enough! Check your BET_AMOUNT and SmartContract MinBetAmount!",
        CONFIG_VALID_GAME: "🚨 Select a valid game in [bot-configuration.js][PCS_CRYPTO_SELECTED] =>",
        CONFIG_VALID_STRATEGY: "🚨 Select a valid strategy [bot-configuration.js][SELECTED_STRATEGY] =>",
        BAD_REPONSE_API: "Bad response from server",
        NO_CONNECTION_BINANCE_API: "Unable to connect to Binance API",
        ERROR_PARSE_JSON_FILE: "Error reading contentJsonFile:"
    },
    WARNING_MESSAGE: {
        INCONSISTENT_QUOTAS: "Inconsistent quotas from smart contract",
        ERROR_TRADINGVIEWSCAN: "Error Obtain signals from TradingViewScan",
        STRATEGY_NOT_EXECUTE: "Strategy not execute!",
        THRESHOLD_NOT_REACHED: "Threshold not reached {percentage} %"
    },
    INFO_MESSAGE: {
        INIT_BOT: "🟡 BOT INITIALIZING...",
        START_BOT: "🟢 BOT STARTED",
        STOP_BOT: "🔴 BOT STOPPED",
        WELCOME_MESSAGE: "🤗 WELCOME ON {crypto}-USDT PREDICTION GAME BOT!",
        WAITING_NEXT_ROUND: "⏰ Waiting for next round:",
        CURRENT_QUOTE_MESSAGE: "⬆️  BullPayout {bullPayout}x - ⬇️  BearPayout {bearPayout}x",
        SIGNAL_UP_MESSAGE: "🔮 Signal Prediction: UP 🟢 {percentage} %",
        SIGNAL_DOWN_MESSAGE: "🔮 Signal Prediction: DOWN 🔴 {percentage} %",
        COPYTRADING_BET_UP_MESSAGE: "",
        COPYTRADING_BET_DOWN_MESSAGE: "",
        MOST_ACTIVE_USER_MESSAGE: ""
    },
    TEMPLATES: {
        UTILS: {
            LOG_SECTION_SEPARATOR: "====================================================================",
            LOG_SUB_SECTION_SEPARATOR: "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ",
            SPACE: " "
        },
        COPYRIGHT: {
            FIRST: "Copyright (c) 2023 l.musarella",
            SECOND: "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to  permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.",
            THIRD: "THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE"
        },
        START_ROUND_EVENT: {

        },
        BET_ROUND_EVENT: {

        },
        END_ROUND_EVENT: {

        },
        STATISTICS: {

        }
    }
}

module.exports = {
    CONSOLE_STRINGS
};