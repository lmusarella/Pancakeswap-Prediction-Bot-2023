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
            SELECTED_STRATEGY: 'COPY_TRADING_STRATEGY',
            QUOTE_STRATEGY: {
                SELECT_LOWER_QUOTE: false
            },
            COPY_TRADING_STRATEGY: {
                WALLET_ADDRESS_TO_EMULATE: '0xe25E5Db92Ad947c89015f085fD830823F3cF2fB8'
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

const mockGlobalConfigurationQuote = {
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
            },
            COPY_TRADING_STRATEGY: {
                WALLET_ADDRESS_TO_EMULATE: '0xe25E5Db92Ad947c89015f085fD830823F3cF2fB8'
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

describe('Copy Trading Strategy - Module - Unit tests', () => {

    const epoch = ethers.BigNumber.from("1");
    const configurationUrl = "../../../bot-configuration/bot-configuration";
    const betStrategyModuleUrl = "../../../bot-lib/strategies/bet-strategy.module";
    const copyTradingStrategyModuleUrl = "../../../bot-lib/strategies/copytrading-strategy.module";
    const mockHistoryModuleUrl = "../../../bot-lib/history/history.module";
    const mockPrintModuleUrl = "../../../bot-lib/common/print.module";

    let betEvent;
    let mockBetStrategyModule;
    let mockHistoryModule;
    let mockPrintModule;

    beforeEach(() => {
        jest.resetModules();

        betEvent = { id: 1, betAmount: 10, skipRound: false, betExecuted: false, bet: null, message: null };

        mockBetStrategyModule = {
            betDownStrategy: async () => Promise.resolve({ betExecuted: true }),
            betUpStrategy: async () => Promise.resolve({ betExecuted: false })
        };

        mockPrintModule = {
            printMostActiveUserMessage: async () => false,
        };

        mockHistoryModule = {
            saveUserActivityInHistory: async () => true,
            getUserActivityFromHistory: async () => {
                return {
                    "0xF60744a047D874d554E95364A63c6bc01AB508Ed": {
                        roundsPlayed: 1,
                        totalAmountBetted: 0.17125805210852157,
                        rounds: [
                            {
                                round: 181125,
                                bet: "bear",
                                betAmount: 0.17125805210852157
                            }
                        ]
                    },
                    "0xD60744a047D874d554E95364A63c6bc01AB508Ed": {
                        roundsPlayed: 2,
                        totalAmountBetted: 0.17125805210852157,
                        rounds: [
                            {
                                round: 181125,
                                bet: "bear",
                                betAmount: 0.17125805210852157
                            },
                            {
                                round: 181126,
                                bet: "bear",
                                betAmount: 0.18125805210852157
                            }
                        ]
                    },
                    "0xH60744a047D874d554E95364A63c6bc01AB508Ed": {
                        roundsPlayed: 1,
                        totalAmountBetted: 0.17125805210852157,
                        rounds: [
                            {
                                round: 181125,
                                bet: "bear",
                                betAmount: 0.17125805210852157
                            }
                        ]
                    }
                }
            }
        };

    });

    test('TEST: isCopyTradingStrategy - true', () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        const copyTradingStrategyModule = require(copyTradingStrategyModuleUrl);
        const result = copyTradingStrategyModule.isCopyTradingStrategy();
        expect(result).toBe(true);
    });

    test('TEST: isCopyTradingStrategy - false', () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationQuote);
        const copyTradingStrategyModule = require(copyTradingStrategyModuleUrl);
        const result = copyTradingStrategyModule.isCopyTradingStrategy();
        expect(result).toBe(false);
    });

    test('TEST: executeBetDownCopyTradingStrategy', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);

        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const copyTradingStrategyModule = require(copyTradingStrategyModuleUrl);
        const result = await copyTradingStrategyModule.executeBetDownCopyTradingStrategy(epoch, betEvent);

        expect(result.betExecuted).toEqual(true);
        expect(result.bet).toEqual(BET_DOWN);
        expect(spyBetUp).toHaveBeenCalledTimes(0);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(epoch);
    });

    test('TEST: executeBetUpCopyTradingStrategy', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        jest.mock(betStrategyModuleUrl, () => mockBetStrategyModule);

        const spyBetDown = jest.spyOn(mockBetStrategyModule, 'betDownStrategy');
        const spyBetUp = jest.spyOn(mockBetStrategyModule, 'betUpStrategy');

        const copyTradingStrategyModule = require(copyTradingStrategyModuleUrl);
        const result = await copyTradingStrategyModule.executeBetUpCopyTradingStrategy(epoch, betEvent);

        expect(result.betExecuted).toEqual(false);
        expect(result.bet).toEqual(BET_UP);
        expect(spyBetUp).toHaveBeenCalledTimes(1);
        expect(spyBetUp).toHaveBeenCalledWith(epoch);
        expect(spyBetDown).toHaveBeenCalledTimes(0)
    });

    test('TEST: getMostActiveUser', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        jest.mock(mockHistoryModuleUrl, () => mockHistoryModule);
        jest.mock(mockPrintModuleUrl, () => mockPrintModule);

        const spyGetUserActivityFromHistory = jest.spyOn(mockHistoryModule, 'getUserActivityFromHistory');
        const spyPrintMostActiveUserMessage = jest.spyOn(mockPrintModule, 'printMostActiveUserMessage');

        const copyTradingStrategyModule = require(copyTradingStrategyModuleUrl);
        await copyTradingStrategyModule.getMostActiveUser();

        expect(spyGetUserActivityFromHistory).toHaveBeenCalledTimes(1);
        expect(spyPrintMostActiveUserMessage).toHaveBeenCalledTimes(1);
        expect(spyPrintMostActiveUserMessage).toHaveBeenCalledWith("0xD60744a047D874d554E95364A63c6bc01AB508Ed", 2);
    });
});