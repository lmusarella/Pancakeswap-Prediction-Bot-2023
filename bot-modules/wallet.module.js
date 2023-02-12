/**
 * @Module 
 * @author luca.musarella
 */

const {ethers} = require('ethers');
const {formatEther} = require('./utils.module');
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  throw result.error;
}

//Set up personal wallet
const wallet = new ethers.Wallet(process.env.PERSONAL_WALLET_PRIVATE_KEY);

//Set up node (bsc chain) to interact with the smart contract
const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_NODE_PROVIDER_URL);
const signer = wallet.connect(provider);

const getPersonalBalance = async () => {
    return signer.getBalance();
}

const getPersonalWalletAddress = async () => {
  return signer.getAddress();
}

const checkBalance = async (amount) => {
  const personalBalance = await getPersonalBalance();
  if (formatEther(personalBalance) < parseFloat(amount)) {
    console.log("😭 You don't have enough balance :", parseFloat(amount), "BNB", "|", "Actual Balance:", formatEther(personalBalance), "BNB");
    process.exit();
  } else {
    console.log(`🤑 Your balance is enough: ${formatEther(personalBalance)} BNB`);
  }
};

module.exports = {
    wallet,
    provider,
    signer,
    getPersonalBalance,
    getPersonalWalletAddress,
    checkBalance
};