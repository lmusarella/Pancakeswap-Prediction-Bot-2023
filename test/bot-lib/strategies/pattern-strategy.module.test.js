const { ethers } = require('ethers');
const { BET_DOWN, BET_UP } = require('../../../bot-lib/common/constants/bot.constants');

const mockGlobalConfiguration = {
    GLOBAL_CONFIG: {
        PCS_CRYPTO_SELECTED: 'CAKE',
        BET_CONFIGURATION: {
            BET_AMOUNT: 10,
            DAILY_GOAL: 10,
            STOP_LOSS: 5
        },
        STRATEGY_CONFIGURATION: {     
            SELECTED_STRATEGY: 'PATTERN_STRATEGY',      
            QUOTE_STRATEGY: {
                SELECT_LOWER_QUOTE: false      
            },
            PATTERN_STRATEGY: {              
                EVENT_PATTERN_NUMBER: 2,           
                DELTA_PRICE_THRESHOLD: 0.2
            }
        },
        SIMULATION_CONFIGURATION: {
            SIMULATION_BALANCE: 25
        },
        ANALYTICS_CONFIGURATION: {
            REGISTER_USERS_ACTIVITY: false
        }
    }
};

const mockGlobalConfigurationNo = {
    GLOBAL_CONFIG: {
        PCS_CRYPTO_SELECTED: 'BNB',
        BET_CONFIGURATION: {
            BET_AMOUNT: 10,
            DAILY_GOAL: 10,
            STOP_LOSS: 5
        },
        STRATEGY_CONFIGURATION: {    
            SELECTED_STRATEGY: 'SIGNALS_STRATEGY',       
            QUOTE_STRATEGY: {
                SELECT_LOWER_QUOTE: true
            },
            PATTERN_STRATEGY: {              
               EVENT_PATTERN_NUMBER: 2,           
               DELTA_PRICE_THRESHOLD: 0.2
           }
        },
        SIMULATION_CONFIGURATION: {
            SIMULATION_BALANCE: 25
        },
        ANALYTICS_CONFIGURATION: {
            REGISTER_USERS_ACTIVITY: false
        }
    }
};

describe('Quote Strategy - Module - Unit tests', () => {

    const epoch = ethers.BigNumber.from("1");
    const configurationUrl = "../../../bot-configuration/bot-configuration";
    const betStrategyModuleUrl = "../../../bot-lib/strategies/bet-strategy.module";
    const pscModuleUrl = "../../../bot-lib/smart-contracts/pcs-prediction-smart-contract.module";
    const mockHistoryModuleUrl = "../../../bot-lib/history/history.module";
    const patternStrategyModuleUrl = "../../../bot-lib/strategies/pattern-strategy.module";
    const oracleCakeModuleurl = "../../../bot-lib/smart-contracts/cake-price-feed-smart-contract.module";
    const oracleBnbModuleurl = "../../../bot-lib/smart-contracts/bnb-price-feed-smart-contract.module";
   
    let betEvent;
    let mockBetStrategyModule;
    let mockSmartContractModuleOpenPriceHigher;
    let mockSmartContractModuleOpenPriceLower;
    let mockHistoryModuleBull;
    let mockHistoryModuleBear;
    let mockHistoryModuleNoEvents;

    let mockOracleBnbModule;
    let mockOracleCakeModule;

    beforeEach(() => {     
        jest.resetModules();

        betEvent = { id: 1, betAmount: 10, skipRound: false, betExecuted: false, bet: null, message: null };

        mockBetStrategyModule = {
            betDownStrategy: async () => Promise.resolve({betExecuted: true}),
            betUpStrategy: async () => Promise.resolve({betExecuted: false})
        };

        mockSmartContractModuleOpenPriceHigher = {
            getRoundData: async () => Promise.resolve({
                round: 1, openPrice: 300, closePrice: 320, bullAmount: 34.5, bearAmount: 14.5, bullPayout: 2.45, bearPayout: 1.45, validQuotes: true, winner: ""
            }),           
        };

        mockSmartContractModuleOpenPriceLower = {
            getRoundData: async () => Promise.resolve({
                round: 1, openPrice: 1, closePrice: 320, bullAmount: 34.5, bearAmount: 14.5, bullPayout: 1.45, bearPayout: 2.45, validQuotes: true, winner: ""
            }),           
        };
        mockHistoryModuleBull = {
            getRoundsFromHistory: async () => [{winner: "bear"}, {winner: "bear"}, {winner: "bear"}]
        };

        mockHistoryModuleBear = {
            getRoundsFromHistory: async () => [{winner: "bull"}, {winner: "bull"}, {winner: "bull"}]
        };

        mockHistoryModuleNoEvents = {
            getRoundsFromHistory: async () => [{winner: "bull"}]
        };

        mockOracleBnbModule = {
            getOracleBnbPrice: async () => 300
        };
        mockOracleCakeModule = {
            getOracleCakePrice: async () => 4
        };


    });

    test('TEST: isPatternStrategy - true', () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        const patternStrategyModule = require(patternStrategyModuleUrl);
        const result = patternStrategyModule.isPatternStrategy();
        expect(result).toBe(true);
    });

    test('TEST: isPatternStrategy - false', () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNo);
        const patternStrategyModule = require(patternStrategyModuleUrl);
        const result = patternStrategyModule.isPatternStrategy();
        expect(result).toBe(false);
    });

    test('TEST: executeStrategyWithPatterns - Bet UP', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(pscModuleUrl, () => mockSmartContractModuleOpenPriceHigher);
        jest.mock(mockHistoryModuleUrl, () => mockHistoryModuleBull);
        jest.mock(oracleBnbModuleurl, () => mockOracleBnbModule);
        jest.mock(oracleCakeModuleurl, () => mockOracleCakeModule);

        const spyGetUserActivityFromHistory = jest.spyOn(mockHistoryModuleBull, 'getRoundsFromHistory');
        const spyGetRoundData = jest.spyOn(mockSmartContractModuleOpenPriceHigher, 'getRoundData');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const patternStrategyModule = require(patternStrategyModuleUrl);
        const result = await patternStrategyModule.executeStrategyWithPatterns(epoch, betEvent);

        expect(result.betExecuted).toEqual(false);
        expect(result.bet).toEqual(BET_UP);

        expect(spyGetUserActivityFromHistory).toHaveBeenCalledTimes(1);
        expect(spyBetUp).toHaveBeenCalledTimes(1);
        expect(spyBetUp).toHaveBeenCalledWith(epoch);
        expect(spyBetDown).toHaveBeenCalledTimes(0);
        expect(spyGetRoundData).toHaveBeenCalledTimes(1);
    });

    test('TEST: executeStrategyWithPatterns - Bet DOWN', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(pscModuleUrl, () => mockSmartContractModuleOpenPriceLower);
        jest.mock(mockHistoryModuleUrl, () => mockHistoryModuleBear);
        jest.mock(oracleBnbModuleurl, () => mockOracleBnbModule);
        jest.mock(oracleCakeModuleurl, () => mockOracleCakeModule);

        const spyGetUserActivityFromHistory = jest.spyOn(mockHistoryModuleBear, 'getRoundsFromHistory');
        const spyGetRoundData = jest.spyOn(mockSmartContractModuleOpenPriceLower, 'getRoundData');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const patternStrategyModule = require(patternStrategyModuleUrl);
        const result = await patternStrategyModule.executeStrategyWithPatterns(epoch, betEvent);

        expect(result.betExecuted).toEqual(true);
        expect(result.bet).toEqual(BET_DOWN);

        expect(spyGetUserActivityFromHistory).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(epoch);
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyGetRoundData).toHaveBeenCalledTimes(1);
    });

    test('TEST: executeStrategyWithPatterns - SKIP', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(pscModuleUrl, () => mockSmartContractModuleOpenPriceHigher);
        jest.mock(mockHistoryModuleUrl, () => mockHistoryModuleNoEvents);
        jest.mock(oracleBnbModuleurl, () => mockOracleBnbModule);
        jest.mock(oracleCakeModuleurl, () => mockOracleCakeModule);

        const spyGetUserActivityFromHistory = jest.spyOn(mockHistoryModuleNoEvents, 'getRoundsFromHistory');
        const spyGetRoundData = jest.spyOn(mockSmartContractModuleOpenPriceHigher, 'getRoundData');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const patternStrategyModule = require(patternStrategyModuleUrl);
        const result = await patternStrategyModule.executeStrategyWithPatterns(epoch, betEvent);

        expect(result.skipRound).toEqual(true);
    
        expect(spyGetUserActivityFromHistory).toHaveBeenCalledTimes(1);
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyBetDown).toHaveBeenCalledTimes(0);
        expect(spyGetRoundData).toHaveBeenCalledTimes(1);
    });
});