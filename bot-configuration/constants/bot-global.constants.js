const GLOBAL_CONFIG = {
    BET_AMOUNT_USD: 0.5, // in USD
    BET_AMOUNT_BNB: 0.001, // in BNB
    BET_AMOUNT_CAKE: 0.001, // in BNB
    DAILY_GOAL: 30, // in USD
    MIN_BNB_BET_AMOUNT: 0.001, // in Crypto (BNB)
    MIN_CAKE_BET_AMOUNT: 0.001, // in Crypto (CAKE)
    WAITING_TIME: 265000, // in Miliseconds (4.3 Minutes)
    THRESHOLD: 55, // Minimum % of certainty of signals (50 - 100),
    WALLET_ADDRESS_TO_EMULATE: '0x83E2680C59b3E17b47333e8F2dc8840e00682109' // Emulate the actions of this address on Pancakeswap prediction game
};

module.exports = {
    GLOBAL_CONFIG
};
