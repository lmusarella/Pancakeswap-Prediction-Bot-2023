const { ethers } = require('ethers');

const mockGlobalConfigurationNoSimulation = {
    GLOBAL_CONFIG: {
        PCS_CRYPTO_SELECTED: 'CAKE', 
        SIMULATION_MODE: false,
        SIMULATION_CONFIGURATION: {
            SIMULATION_BALANCE: 25
        },
        BET_CONFIGURATION: {
            BET_AMOUNT: 10,
            DAILY_GOAL: 10,
            STOP_LOSS: 5
        },
        STRATEGY_CONFIGURATION: {
            CLAIM_REWARDS: false,
        },
        ANALYTICS_CONFIGURATION: {
            REGISTER_USERS_ACTIVITY: false
        }
    }
};

const mockGlobalConfigurationYesSimulation = {
    GLOBAL_CONFIG: {
        PCS_CRYPTO_SELECTED: 'CAKE',
        SIMULATION_MODE: true,
        SIMULATION_CONFIGURATION: {
            SIMULATION_BALANCE: 25
        },  
        BET_CONFIGURATION: {
            BET_AMOUNT: 10,
            DAILY_GOAL: 10,
            STOP_LOSS: 5
        },
        STRATEGY_CONFIGURATION: {
            CLAIM_REWARDS: true,
        },
        ANALYTICS_CONFIGURATION: {
            REGISTER_USERS_ACTIVITY: false
        }
    }
};

describe('BetStrategy - Module - Unit tests', () => {

    const epoch = ethers.BigNumber.from("1");
    const configurationUrl = "../../../bot-configuration/bot-configuration";
    const pscModuleUrl = "../../../bot-lib/smart-contracts/pcs-prediction-smart-contract.module";
    const betStrategyModuleUrl = "../../../bot-lib/strategies/bet-strategy.module";
    const walletModuleUrl = "../../../bot-lib/wallet/wallet.module";

    let mockModuleSuccessTx;
    let mockModuleErrorTx;

    beforeEach(() => {     
        jest.resetModules();

        mockModuleSuccessTx = {
            betDown: async () => Promise.resolve({
                status: 1,
                gasUsed: 900000,
                effectiveGasPrice: 900000000,
                transactionExeption: false
            }),
            betUp: async () => Promise.resolve({
                status: 1,
                gasUsed: 900000,
                effectiveGasPrice: 900000000,
                transactionExeption: false
            }),
            claimRewards: async () => Promise.resolve({ status: 1, transactionExeption: false }),
            isClaimableRound: async () => Promise.resolve(true)
        };
        
        mockModuleErrorTx = {
            betDown: async () => Promise.resolve({
                status: 0,
                gasUsed: 0,
                effectiveGasPrice: 0,
                transactionExeption: true
            }),
            betUp: async () => Promise.resolve({
                status: 0,
                gasUsed: 0,
                effectiveGasPrice: 0,
                transactionExeption: true
            }),
            claimRewards: async () => Promise.resolve({ status: 0, transactionExeption: true }),
            isClaimableRound: async () => Promise.resolve(false)
        };

    });

    test('TEST: betDownStrategy Executed - NO Simulation', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoSimulation);
        jest.mock(pscModuleUrl, () => mockModuleSuccessTx);

        const spyBetDown = jest.spyOn(mockModuleSuccessTx, 'betDown');
        const spyUpdateSimulationBalance = jest.spyOn(require(walletModuleUrl), 'updateSimulationBalance');
       
        const betStrategyModule = require(betStrategyModuleUrl);
        const result = await betStrategyModule.betDownStrategy(epoch);

        expect(result.betExecuted).toBe(true);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(10, epoch);
        expect(spyUpdateSimulationBalance).toHaveBeenCalledTimes(0);
    });

    test('TEST: betDownStrategy Not Executed - NO Simulation', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoSimulation);
        jest.mock(pscModuleUrl, () => mockModuleErrorTx);

        const spyBetDown = jest.spyOn(mockModuleErrorTx, 'betDown');
        const spyUpdateSimulationBalance = jest.spyOn(require(walletModuleUrl), 'updateSimulationBalance');

        const betStrategyModule = require(betStrategyModuleUrl);
        const result = await betStrategyModule.betDownStrategy(epoch);

        expect(result.betExecuted).toBe(false);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(10, epoch);
        expect(spyUpdateSimulationBalance).toHaveBeenCalledTimes(0);
    });

    test('TEST: betUpStrategy Executed - NO Simulation', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoSimulation);
        jest.mock(pscModuleUrl, () => mockModuleSuccessTx);

        const spyBetDown = jest.spyOn(mockModuleSuccessTx, 'betUp');
        const spyUpdateSimulationBalance = jest.spyOn(require(walletModuleUrl), 'updateSimulationBalance');
        const betStrategyModule = require(betStrategyModuleUrl);

        const result = await betStrategyModule.betUpStrategy(epoch);

        expect(result.betExecuted).toBe(true);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(10, epoch);
        expect(spyUpdateSimulationBalance).toHaveBeenCalledTimes(0);
    });

    test('TEST: betUpStrategy Not Executed - NO Simulation', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoSimulation);
        jest.mock(pscModuleUrl, () => mockModuleErrorTx);

        const spyBetDown = jest.spyOn(mockModuleErrorTx, 'betUp');
        const spyUpdateSimulationBalance = jest.spyOn(require(walletModuleUrl), 'updateSimulationBalance');
        const betStrategyModule = require(betStrategyModuleUrl);

        const result = await betStrategyModule.betUpStrategy(epoch);

        expect(result.betExecuted).toBe(false);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(10, epoch);
        expect(spyUpdateSimulationBalance).toHaveBeenCalledTimes(0);
    });

    test('TEST: betUpStrategy - YES Simulation', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationYesSimulation);
        jest.mock(pscModuleUrl, () => mockModuleErrorTx);

        const spyBetDown = jest.spyOn(mockModuleErrorTx, 'betUp');
        const spyUpdateSimulationBalance = jest.spyOn(require(walletModuleUrl), 'updateSimulationBalance');
        const betStrategyModule = require(betStrategyModuleUrl);

        const result = await betStrategyModule.betUpStrategy(epoch);

        expect(result.betExecuted).toBe(false);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(10, epoch);
        expect(spyUpdateSimulationBalance).toHaveBeenCalledTimes(1);
        expect(spyUpdateSimulationBalance).toHaveBeenCalledWith(15);
    });

    test('TEST: betDownStrategy - YES Simulation', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationYesSimulation);
        jest.mock(pscModuleUrl, () => mockModuleErrorTx);

        const spyBetDown = jest.spyOn(mockModuleErrorTx, 'betDown');
        const spyUpdateSimulationBalance = jest.spyOn(require(walletModuleUrl), 'updateSimulationBalance');
        
        const betStrategyModule = require(betStrategyModuleUrl);
        const result = await betStrategyModule.betDownStrategy(epoch);

        expect(result.betExecuted).toBe(false);
        expect(spyBetDown).toHaveBeenCalledTimes(1);
        expect(spyBetDown).toHaveBeenCalledWith(10, epoch);
        expect(spyUpdateSimulationBalance).toHaveBeenCalledTimes(1);
        expect(spyUpdateSimulationBalance).toHaveBeenCalledWith(15);
    });

    test('TEST: claimStrategy - Call claimRewards', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationYesSimulation);
        jest.mock(pscModuleUrl, () => mockModuleSuccessTx);

        const spyClaimRewards = jest.spyOn(mockModuleSuccessTx, 'claimRewards');
        const spyIsClaimable = jest.spyOn(mockModuleSuccessTx, 'isClaimableRound');

        const betStrategyModule = require(betStrategyModuleUrl);
        const result = await betStrategyModule.claimStrategy(epoch);
        
        expect(result).toEqual({ status: 1, transactionExeption: false });
        expect(spyClaimRewards).toHaveBeenCalledTimes(1);
        expect(spyIsClaimable).toHaveBeenCalledTimes(1);
        expect(spyClaimRewards).toHaveBeenCalledWith([epoch]);
        expect(spyIsClaimable).toHaveBeenCalledWith(epoch);
    });


    test('TEST: claimStrategy - Not Called claimRewards', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfigurationNoSimulation);
        jest.mock(pscModuleUrl, () => mockModuleErrorTx);

        const spyClaimRewards = jest.spyOn(mockModuleErrorTx, 'claimRewards');
        const spyIsClaimable = jest.spyOn(mockModuleErrorTx, 'isClaimableRound');

        const betStrategyModule = require(betStrategyModuleUrl);
        const result = await betStrategyModule.claimStrategy(epoch);
       
        expect(result).toEqual({ status: 0, txGasFee: 0});
        expect(spyClaimRewards).toHaveBeenCalledTimes(0);
        expect(spyIsClaimable).toHaveBeenCalledTimes(0);
    });

});