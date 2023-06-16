const { ethers } = require('ethers');
const { BET_DOWN, BET_UP } = require('../../../bot-lib/common/constants/bot.constants');

const mockGlobalConfigurationHigherQuotes = {
    GLOBAL_CONFIG: {
        PCS_CRYPTO_SELECTED: 'CAKE',
        BET_CONFIGURATION: {
            BET_AMOUNT: 10,
            DAILY_GOAL: 10,
            STOP_LOSS: 5
        },
        STRATEGY_CONFIGURATION: {     
            SELECTED_STRATEGY: 'QUOTE_STRATEGY',      
            QUOTE_STRATEGY: {
                SELECT_LOWER_QUOTE: false      
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

const mockGlobalConfigurationLowerQuotes = {
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
   
    const quoteStrategyModuleUrl = "../../../bot-lib/strategies/quote-strategy.module";
   
    let betEvent;
    let mockBetStrategyModule;
    let mockSmartContractModuleBullPayout;
    let mockSmartContractModuleBearPayout;
    let mockSmartContractModuleNoValidQuotes;

    beforeEach(() => {     
        jest.resetModules();

        betEvent = { id: 1, betAmount: 10, skipRound: false, betExecuted: false, bet: null, message: null };

        mockBetStrategyModule = {
            betDownStrategy: async () => Promise.resolve(true),
            betUpStrategy: async () => Promise.resolve(false)
        };

        mockSmartContractModuleBullPayout = {
            getRoundData: async () => Promise.resolve({
                round: 1, openPrice: 300, closePrice: 320, bullAmount: 34.5, bearAmount: 14.5, bullPayout: 2.45, bearPayout: 1.45, validQuotes: true, winner: ""
            }),           
        };

        mockSmartContractModuleBearPayout = {
            getRoundData: async () => Promise.resolve({
                round: 1, openPrice: 300, closePrice: 320, bullAmount: 34.5, bearAmount: 14.5, bullPayout: 1.45, bearPayout: 2.45, validQuotes: true, winner: ""
            }),           
        };

        mockSmartContractModuleNoValidQuotes = {
            getRoundData: async () => Promise.resolve({
                round: 1, openPrice: 300, closePrice: 320, bullAmount: 34.5, bearAmount: 14.5, bullPayout: 2.45, bearPayout: 1.45, validQuotes: false, winner: ""
            }),           
        };

    });

    test('TEST: isQuoteStrategy - true', () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationHigherQuotes);
        const quoteStrategyModule = require(quoteStrategyModuleUrl);
        const result = quoteStrategyModule.isQuoteStrategy();
        expect(result).toBe(true);
    });

    test('TEST: isQuoteStrategy - false', () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationLowerQuotes);
        const quoteStrategyModule = require(quoteStrategyModuleUrl);
        const result = quoteStrategyModule.isQuoteStrategy();
        expect(result).toBe(false);
    });

    test('TEST: executeStrategyWithQuotes - LOWER QUOTES - Bull > Bear', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationLowerQuotes);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(pscModuleUrl, () => mockSmartContractModuleBullPayout);

        const spyGetRoundData = jest.spyOn(mockSmartContractModuleBullPayout, 'getRoundData');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const quoteStrategyModule = require(quoteStrategyModuleUrl);
        const result = await quoteStrategyModule.executeStrategyWithQuotes(epoch, betEvent);

        expect(result.betExecuted).toEqual(true);
        expect(result.bet).toEqual(BET_DOWN);
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(epoch);
        expect(spyGetRoundData).toHaveBeenCalledTimes(1);
        expect(spyGetRoundData).toHaveBeenCalledWith(epoch);
    });

    test('TEST: executeStrategyWithQuotes - LOWER QUOTES - Bear > Bull', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationLowerQuotes);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(pscModuleUrl, () => mockSmartContractModuleBearPayout);

        const spyGetRoundData = jest.spyOn(mockSmartContractModuleBearPayout, 'getRoundData');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const quoteStrategyModule = require(quoteStrategyModuleUrl);
        const result = await quoteStrategyModule.executeStrategyWithQuotes(epoch, betEvent);

        expect(result.betExecuted).toEqual(false);
        expect(result.bet).toEqual(BET_UP);
        expect(spyBetUp).toHaveBeenCalledTimes(1);
        expect(spyBetUp).toHaveBeenCalledWith(epoch);
        expect(spyBetDown).toHaveBeenCalledTimes(0);
        expect(spyGetRoundData).toHaveBeenCalledTimes(1);
        expect(spyGetRoundData).toHaveBeenCalledWith(epoch);
    });

    test('TEST: executeStrategyWithQuotes - HIGHER QUOTES - Bull > Bear', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationHigherQuotes);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(pscModuleUrl, () => mockSmartContractModuleBullPayout);

        const spyGetRoundData = jest.spyOn(mockSmartContractModuleBullPayout, 'getRoundData');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const quoteStrategyModule = require(quoteStrategyModuleUrl);
        const result = await quoteStrategyModule.executeStrategyWithQuotes(epoch, betEvent);

        expect(result.betExecuted).toEqual(false);
        expect(result.bet).toEqual(BET_UP);
        expect(spyBetUp).toHaveBeenCalledTimes(1);
        expect(spyBetUp).toHaveBeenCalledWith(epoch);
        expect(spyBetDown).toHaveBeenCalledTimes(0);
        expect(spyGetRoundData).toHaveBeenCalledTimes(1);
        expect(spyGetRoundData).toHaveBeenCalledWith(epoch);
    });

    test('TEST: executeStrategyWithQuotes - HIGHER QUOTES - Bear > Bull', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationHigherQuotes);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(pscModuleUrl, () => mockSmartContractModuleBearPayout);
       
        const spyGetRoundData = jest.spyOn(mockSmartContractModuleBearPayout, 'getRoundData');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const quoteStrategyModule = require(quoteStrategyModuleUrl);
        const result = await quoteStrategyModule.executeStrategyWithQuotes(epoch, betEvent);

        expect(result.betExecuted).toEqual(true);
        expect(result.bet).toEqual(BET_DOWN);
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(epoch);
        expect(spyGetRoundData).toHaveBeenCalledTimes(1);
        expect(spyGetRoundData).toHaveBeenCalledWith(epoch);
    });

    test('TEST: executeStrategyWithQuotes - NO VALID QUOTES', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationHigherQuotes);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(pscModuleUrl, () => mockSmartContractModuleNoValidQuotes);

        const spyGetRoundData = jest.spyOn(mockSmartContractModuleNoValidQuotes, 'getRoundData');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const quoteStrategyModule = require(quoteStrategyModuleUrl);
        const result = await quoteStrategyModule.executeStrategyWithQuotes(epoch, betEvent);

        expect(result.betExecuted).toEqual(false);
        expect(result.skipRound).toEqual(true);
        expect(result.bet).toBeNull();
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyBetDown).toHaveBeenCalledTimes(0);
        expect(spyGetRoundData).toHaveBeenCalledTimes(1);
        expect(spyGetRoundData).toHaveBeenCalledWith(epoch);
    });

});