const { ethers } = require('ethers');
const { CAKE_CRYPTO, BNB_CRYPTO, BET_UP, BET_DOWN } = require('../../../bot-lib/common/constants/bot.constants');

const mockGlobalConfigurationNoStrategy = {
    GLOBAL_CONFIG: {
        PCS_CRYPTO_SELECTED: 'CAKE',
        SELECTED_STRATEGY: 'QUOTE_STRATEGY',   
        BET_CONFIGURATION: {
            BET_AMOUNT: 10,
            DAILY_GOAL: 10,
            STOP_LOSS: 5
        },
        STRATEGY_CONFIGURATION: {           
            SIGNAL_STRATEGY: {           
                THRESHOLD: 55,
                DATASOURCE: "BINANCE",
                REVERSE_BETTING: true
            }
        }
    }
};

const mockGlobalConfiguration = {
    GLOBAL_CONFIG: {
        PCS_CRYPTO_SELECTED: 'BNB',
        SELECTED_STRATEGY: 'SIGNAL_STRATEGY',
        BET_CONFIGURATION: {
            BET_AMOUNT: 10,
            DAILY_GOAL: 10,
            STOP_LOSS: 5
        },
        STRATEGY_CONFIGURATION: {           
            SIGNAL_STRATEGY: {           
                THRESHOLD: 55,
                DATASOURCE: "BINANCE",
                REVERSE_BETTING: false
            },
        }
    }
};

describe('Signals Strategy - Module - Unit tests', () => {

    const epoch = ethers.BigNumber.from("1");
    const configurationUrl = "../../../bot-configuration/bot-configuration";
    const betStrategyModuleUrl = "../../../bot-lib/strategies/bet-strategy.module";
    const signalsDataModuleUrl = "../../../bot-lib/external-data/trading-signals.module";
    const signalsStrategyModuleUrl = "../../../bot-lib/strategies/signals-strategy.module";
   
    let betEvent;
    let mockBetStrategyModule;
    let mockSignalsUp;
    let mockSignalsDown;
    let mockSignalsThresholdNotReached;

    beforeEach(() => {     
        jest.resetModules();

        betEvent = { id: 1, betAmount: 10, skipRound: false, betExecuted: false, bet: null, message: null };

        mockBetStrategyModule = {
            betDownStrategy: async () => Promise.resolve(true),
            betUpStrategy: async () => Promise.resolve(false)
        };
        
        mockSignalsUp = {
            getTradingSignals: async () => Promise.resolve({
                buy: 23, sell: 12, neutral: 4
            }),           
        };

        mockSignalsDown = {
            getTradingSignals: async () => Promise.resolve({
                buy: 14, sell: 34, neutral: 4
            }),           
        };

        mockSignalsThresholdNotReached = {
            getTradingSignals: async () => Promise.resolve({
                buy: 12, sell: 12, neutral: 23
            }),           
        };

    });

    test('TEST: isSignalStrategy - true', () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        const signalsStrategyModule = require(signalsStrategyModuleUrl);
        const result = signalsStrategyModule.isSignalStrategy();
        expect(result).toBe(true);
    });

    test('TEST: isSignalStrategy - false', () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoStrategy);
        const signalsStrategyModule = require(signalsStrategyModuleUrl);
        const result = signalsStrategyModule.isSignalStrategy();
        expect(result).toBe(false);
    });

    test('TEST: executeStrategyWithSignals - SINGNAL UP - NO REVERSE', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(signalsDataModuleUrl, () => mockSignalsUp);

        const spyGetSignals = jest.spyOn(mockSignalsUp, 'getTradingSignals');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const signalStrategyModule = require(signalsStrategyModuleUrl);
        const result = await signalStrategyModule.executeStrategyWithSignals(epoch, betEvent);

        expect(result.betExecuted).toEqual(false);
        expect(result.bet).toEqual(BET_UP);
        expect(spyBetUp).toHaveBeenCalledTimes(1);
        expect(spyBetUp).toHaveBeenCalledWith(epoch);
        expect(spyBetDown).toHaveBeenCalledTimes(0);
        expect(spyGetSignals).toHaveBeenCalledTimes(1);
        expect(spyGetSignals).toHaveBeenCalledWith(BNB_CRYPTO);
    });

    test('TEST: executeStrategyWithSignals - SINGNAL DOWN - NO REVERSE', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(signalsDataModuleUrl, () => mockSignalsDown);

        const spyGetSignals = jest.spyOn(mockSignalsDown, 'getTradingSignals');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const signalStrategyModule = require(signalsStrategyModuleUrl);
        const result = await signalStrategyModule.executeStrategyWithSignals(epoch, betEvent);

        expect(result.betExecuted).toEqual(true);
        expect(result.bet).toEqual(BET_DOWN);
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(epoch);
        expect(spyGetSignals).toHaveBeenCalledTimes(1);
        expect(spyGetSignals).toHaveBeenCalledWith(BNB_CRYPTO);
    });

    test('TEST: executeStrategyWithSignals - SINGNAL UP - REVERSE', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoStrategy);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(signalsDataModuleUrl, () => mockSignalsUp);

        const spyGetSignals = jest.spyOn(mockSignalsUp, 'getTradingSignals');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const signalStrategyModule = require(signalsStrategyModuleUrl);
        const result = await signalStrategyModule.executeStrategyWithSignals(epoch, betEvent);

        expect(result.betExecuted).toEqual(true);
        expect(result.bet).toEqual(BET_DOWN);
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(epoch);
        expect(spyGetSignals).toHaveBeenCalledTimes(1);
        expect(spyGetSignals).toHaveBeenCalledWith(CAKE_CRYPTO);
    });

    test('TEST: executeStrategyWithSignals - SINGNAL DOWN - REVERSE', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoStrategy);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(signalsDataModuleUrl, () => mockSignalsDown);

        const spyGetSignals = jest.spyOn(mockSignalsDown, 'getTradingSignals');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const signalStrategyModule = require(signalsStrategyModuleUrl);
        const result = await signalStrategyModule.executeStrategyWithSignals(epoch, betEvent);

        expect(result.betExecuted).toEqual(false);
        expect(result.bet).toEqual(BET_UP);
        expect(spyBetUp).toHaveBeenCalledTimes(1);
        expect(spyBetUp).toHaveBeenCalledWith(epoch);
        expect(spyBetDown).toHaveBeenCalledTimes(0);
        expect(spyGetSignals).toHaveBeenCalledTimes(1);
        expect(spyGetSignals).toHaveBeenCalledWith(CAKE_CRYPTO);
    });

    test('TEST: executeStrategyWithSignals - NO THRESHOLD REACHED', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoStrategy);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(signalsDataModuleUrl, () => mockSignalsThresholdNotReached);

        const spyGetSignals = jest.spyOn(mockSignalsThresholdNotReached, 'getTradingSignals');
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const signalStrategyModule = require(signalsStrategyModuleUrl);
        const result = await signalStrategyModule.executeStrategyWithSignals(epoch, betEvent);

        expect(result.betExecuted).toEqual(false);
        expect(result.skipRound).toEqual(true);
        expect(result.bet).toBeNull();
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyBetDown).toHaveBeenCalledTimes(0);
        expect(spyGetSignals).toHaveBeenCalledTimes(1);
        expect(spyGetSignals).toHaveBeenCalledWith(CAKE_CRYPTO);
    });

    test('TEST: executeStrategyWithSignals - NO SINGNALS', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoStrategy);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);
        jest.mock(signalsDataModuleUrl, () => mockSignalsThresholdNotReached);

        const spyGetSignals = jest.spyOn(mockSignalsThresholdNotReached, 'getTradingSignals').mockImplementation(() => Promise.resolve(null));
        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const signalStrategyModule = require(signalsStrategyModuleUrl);
        const result = await signalStrategyModule.executeStrategyWithSignals(epoch, betEvent);

        expect(result.betExecuted).toEqual(false);
        expect(result.skipRound).toEqual(true);
        expect(result.bet).toBeNull();
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyBetDown).toHaveBeenCalledTimes(0);
        expect(spyGetSignals).toHaveBeenCalledTimes(1);
        expect(spyGetSignals).toHaveBeenCalledWith(CAKE_CRYPTO);
    });


});