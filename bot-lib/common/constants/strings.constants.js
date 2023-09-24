const CONSOLE_STRINGS = {
    YES: "✔️ ",
    NO: "❌",
    USD: "USD",
    EQUAL: "=",
    STOP_ICON: "⛔",
    GREATER: "greater",
    LESS: "less",
    ERROR_MESSAGE: {
        STOP_LOSS_GOAL: "Stop Loss or Daily Goal reached!",
        BALANCE_NOT_ENOUGH: "Your balance is not enough! Check your BET_AMOUNT and SmartContract MinBetAmount!",
        CONFIG_VALID_GAME: "🚨 Select a valid game in [bot-configuration.js][PCS_CRYPTO_SELECTED] =>",
        CONFIG_VALID_STRATEGY: "🚨 Select a valid strategy [bot-configuration.js][SELECTED_STRATEGY] =>",
        BAD_REPONSE_API: "Bad response from server",
        NO_CONNECTION_BINANCE_API: "Unable to connect to Binance API",
        ERROR_PARSE_JSON_FILE: "Error reading contentJsonFile:",
        BET_NOT_EXECUTED: "⛔ Bet not executed! Transaction Error!",
        CLAIM_TRANSACTION_ERR: "⛔ Claim Transaction Error!",
        TRANSACTION_EXE: "⛔ Transaction Error [{time}][{round}][{errorCode}} ] =>"
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
        WAITING_NEXT_ROUND: "⏰ Waiting for next round: {nextRound}",
        MOST_ACTIVE_USER_MESSAGE: "💻 One of the most active players in the last rounds! [{user}] with: {roundPlayed} rounds played!",
        CURRENT_QUOTE_MESSAGE: "⬆️  BullPayout {bullPayout}x - ⬇️  BearPayout {bearPayout}x",
        SIGNAL_UP_MESSAGE: "🔮 Signal Prediction: UP 🟢 {percentage} %",
        SIGNAL_DOWN_MESSAGE: "🔮 Signal Prediction: DOWN 🔴 {percentage} %",
        COPYTRADING_BET_UP_MESSAGE: "🔮 Friend {friendAddress} bet to UP 🟢",
        COPYTRADING_BET_DOWN_MESSAGE: "🔮 Friend {friendAddress} bet to DOWN 🔴",
        CLAIM_MESSAGE: "🗿 Round [{round}] Successful claimed {usd} USD = {crypto} {cryptoCurrency}",
        INACTIVITY_USER_MESSAGE: "🥺 Round [{round}] Sorry your friend [{friendAddress}] didn't bet!",
        SKIP_MESSAGE: "♻️  Skip: {message}",
        SKIP_ROUND_MESSAGE: "♻️  Skip round: {round}",
        MARTINGALE_MODE_MESSAGE: "🚨 Bot is running in Martingale Mode! Waiting pending rounds: [{rounds}] - if some rounds remain hanging, they will be eliminated after {numR} rounds.",
        BOT_STOPPING_MESSAGE: "🚨 Bot is stopping! Waiting pending rounds: [{rounds}]",
        WAITING_STRATEGY_MESSAGE: "⏰ Waiting {minutes} minutes before execute {strategy}",
        EVENT_PATTERN_NOT_FOUND: "No pattern found. No event {event} repeated {n} times",
        EVENT_NOT_PREDICTABLE: "Previous Rounds's {round} Event not predictable - the absolute difference price {difference} does not reach the threshold: {threshold}",
        PATTERN_STATEGY_BET_MESSAGE: "🔮 The previous round {previous} is very likely to end with the following outcome: {res}",
        PATTERN_STATEGY_PRICE_MESSAGE: "⚖️  Current price: {currentPrice} is {current} than open price: {openPrice}, price difference: {difference}, it seems that the pattern is respected, {res} event repeated {numberEvent} times!",
    },
    TEMPLATES: {
        UTILS: {
            LOG_SECTION_SEPARATOR: "====================================================================",
            LOG_SUB_SECTION_SEPARATOR: "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ",
            SPACE: " ",
            EMPTY: ""
        },
        CALL_TO_ACTION: {
            HEADER: "❤️  DONATIONS & SUPPORT",
            CALL_TO_ACTION_STAR: "To support me leave a star ⭐ to my GitHub repository",
            CALL_TO_ACTION_REPOLINK: "https://github.com/lmusarella/Pancakeswap-Prediction-Bot-2023",
            CALL_TO_ACTION_DONATION: "If you want to make a small donation you can make it on my personal wallet",
            CALL_TO_ACTION_DONATION_WALLET: "0x0C40e4F3606aE2F41DAc9bB67606f41284755350",
            CALL_TO_ACTION_THANK: "Thank you so much! 🙏 Happy continuation!"
        },
        COPYRIGHT: {
            FIRST_LINE: "Copyright (c) 2023 l.musarella",
            SECOND_LINE: "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to  permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.",
            THIRD_LINE: "THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE"
        },
        WELCOME_MESSAGE: {
            FIRST_LINE: "🤗 WELCOME ON {crypto}-USDT PREDICTION GAME BOT!"
        },
        START_ROUND_EVENT: {
            HEADER: "⚔️  ROUND: {round} | {time} | START 🎉",
            BALANCE: "Current Balance:",
            PROFIT: "Current Profit:"
        },
        BET_ROUND_EVENT: {
            HEADER: "⚔️  ROUND: {round} | {time} | BET 🎲",
            BET_EXECUTED: "✔️  Successful bet",
            BET_UP: "UP 🟢",
            BET_DOWN: "DOWN 🔴"           
        },
        END_ROUND_EVENT: {
            HEADER: "⚔️  ROUND: {round} | {time} | END 🏁",           
            BET_TAX: "⛽ Bet Tx Fee:",
            CLAIM_TAX: "⛽ Claim Tx Fee:",
            WIN: "👍 Won:",
            LOSS: "👎 Lost:",
            PROFIT: "📈 Bet Profit: {profit} % of Bet Amount",
            CLAIM_EXECUTED: "✔️  Rewards Claimed",
            CLAIM_NOT_EXECUTED: "❌ NO Rewards"      
        },
        STATISTICS: {
            HEADER: "📊 BETTING STATISTICS [ ✔️  Executed {executed} | ⏳ Pending {betPending} | ⛔ Errors {betErrors} ]",
            FORTUNE: "🍀 Fortune: {fortune} %",
            WIN_LOSS: "👍 {win}|{loss} 👎",
            NO_FEE: "(fees excluded)",
            PROFIT: "💰 Profit:",
            FEES: "⛽ Total Fees:"
        },
        GLOBAL_SETTINGS: {
            HEADER: "⚙️  GLOBAL SETTINGS",
            BOT_STRATEGY: "▫️ Bot Strategy:",
            COPY_TRADE_ADDRES: "▫️ Copy Target Address:",
            SIMULATION_MODE: "▫️ Simulation Mode:",
            CLAIM_MODE: "▫️ Auto Claim:",
            MARTINGALE: "▫️ Martingale:",
            ANTI_MARTINGALE: "▫️ Anti-Martingale:",
            BET_AMOUNT: "▫️ Bet Amount:",
            DAILY_GOAL: "▫️ Daily Goal:",
            INCREMENT_BET_AMOUNT: "▫️ Increment Bet Amount:",
            STOP_LOSS: "▫️ Stop Loss:",
            REGISTER_USERS: "▫️ Track Users Activity:",
            REGISTER_ROUNDS: "▫️ Track All Rounds:",
            RESET_HISTORY_BACKUP: "▫️ Reset & Backup History:",
        },
        WALLET_INFO: {
            HEADER: "💻 WALLET",
            ADDRESS: "▫️ Address:",
            BALANCE: "▫️ Balance:"
        }
    }
}

module.exports = {
    CONSOLE_STRINGS
};