const { ethers } = require("ethers");

const mockGlobalConfiguration = {
    GLOBAL_CONFIG: {
        PCS_CRYPTO_SELECTED: 'CAKE',
        SIMULATION_CONFIGURATION: {
            SIMULATION_BALANCE: 25
        }, 
        BET_CONFIGURATION: {
            BET_AMOUNT: 10
        },
        ANALYTICS_CONFIGURATION: {
            REGISTER_USERS_ACTIVITY: false
        }
    }
};

describe('Wallet - Module - Unit tests', () => {

    const configurationUrl = "../../../bot-configuration/bot-configuration";
    const walletModuleUrl = "../../../bot-lib/wallet/wallet.module";
    
    beforeEach(() => {     
        jest.resetModules();
    });

    test('TEST: Wallet, Provider, Signer', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration);
        const walletModule = require(walletModuleUrl);
        const wallet = walletModule.wallet;
        const provider = walletModule.provider;
        const signer = walletModule.signer;
        const block = await provider.getBlock(27689816);
        expect(await wallet.getAddress()).toEqual(process.env.PERSONAL_WALLET_ADDRESS);
        expect(block.number).toEqual(27689816);
        expect(await signer.getAddress()).toEqual(process.env.PERSONAL_WALLET_ADDRESS);
    });

    test('TEST: getBNBBalance', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration); 
        const walletModule = require(walletModuleUrl);
        const spySigner = jest.spyOn(walletModule.signer, 'getBalance').mockImplementation(() => Promise.resolve(ethers.BigNumber.from("100000000000000000")));
        const result = await walletModule.getBNBBalance();
        expect(result).toEqual(0.1);
        expect(spySigner).toHaveBeenCalledTimes(1);
    });

    test('TEST: getGasPrice', async () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration); 
        const walletModule = require(walletModuleUrl);
        const spyProvider = jest.spyOn(walletModule.provider, 'getGasPrice').mockImplementation(() => Promise.resolve(ethers.BigNumber.from("100000000")));
        const result = await walletModule.getGasPrice();
        expect(result).toEqual(100000000);
        expect(spyProvider).toHaveBeenCalledTimes(1);
    });

    test('TEST: SIMULATION.FAKE_BALANCE', () => {
        jest.mock(configurationUrl, () => mockGlobalConfiguration); 
        const walletModule = require(walletModuleUrl);
        const result = walletModule.getSimulationBalance();
        expect(result).toEqual(25);
        walletModule.updateSimulationBalance(50);
        const result1 = walletModule.getSimulationBalance();
        expect(result1).toEqual(50);
    });


});