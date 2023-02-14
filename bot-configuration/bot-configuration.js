const GLOBAL_CONFIG = {
    BET_CONFIGURATION: {
        BET_AMOUNT_BNB: 0.001, // in BNB
        BET_AMOUNT_CAKE: 0.001, // in Cake
        DAILY_GOAL: 30, // in USD
        STOP_LOSS: 5 // in USD
    },
    STRATEGY_CONFIGURATION: {  
        CLAIM_REWARDS: true, // Auto claim the rewards 
        SIMULATION_MODE: true, // In simulation mode the Bot its running without excute real transaction
        SIMULATION_BALANCE: 1000, // In simulation mode use this balance (Crypto)
        WAITING_TIME: 265000, // in Miliseconds (4.3 Minutes)
        SELECTED_STRATEGY: 'QUOTE_STRATEGY', // "SIGNAL_STRATEGY" or "QUOTE_STRATEGY" or "COPY_TRADING_STRATEGY"
        SIGNAL_STRATEGY: {           
            THRESHOLD: 55, // Minimum % of certainty of signals (50 - 100)
            DATASOURCE: "BINANCE" // Datasoure of the trading signals
        },
        QUOTE_STRATEGY: {
            SELECT_LOWER_QUOTE: true // Bet on the lower quote from Pancakeswap prediction       
        },
        COPY_TRADING_STRATEGY: {         
            WALLET_ADDRESS_TO_EMULATE: '0x83E2680C59b3E17b47333e8F2dc8840e00682109' // Emulate the actions of this address on Pancakeswap prediction game
        }
    }
};

module.exports = {
    GLOBAL_CONFIG
};
