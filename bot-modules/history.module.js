/**
 * @Module 
 * @author luca.musarella
 */
const _ = require("lodash");
const Big = require("big.js");
const {utils} = require('ethers');
const {writeOrUpdateFile, getFileJsonContent, percentageChange} = require('./utils.module');
const {BET_DOWN, BET_UP} = require("../bot-configuration/constants/bot.constants");

const generateFilePath = (fileName) => {
  const date = new Date();
  const day = date.getDate();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return getFilePath(`${year}${month}${day}-${fileName}`);
};

const getFilePath = (fileName) => {
    return `./bot-history/${fileName}.json`;
};

  const saveRoundInHistory = async (roundData, fileName) => {
    const path = generateFilePath(fileName.toLowerCase());
    const roundsHistoryParsed = await getFileJsonContent(path);
    if (roundsHistoryParsed) {
          let mergedRoundsHistory;
          try {        
            mergedRoundsHistory = mergeRoundHistory(roundsHistoryParsed, roundData);
          } catch (e) {
            console.log(e);
            return;
          }      
          writeOrUpdateFile(path, mergedRoundsHistory);
          return mergedRoundsHistory;  
      } else {       
        writeOrUpdateFile(path, roundData);
        return roundData; 
      }
  };

  const getStatisticFromHistory = async (fileName) => {
    const path = generateFilePath(fileName.toLowerCase());
    const statisticsHistoryParsed = await getFileJsonContent(path);
    return statisticsHistoryParsed;
  }

  const saveStatisticsInHistory = async (statisticsData, fileName) => {
    const path = generateFilePath(fileName.toLowerCase());
    writeOrUpdateFile(path, statisticsData);
    return statisticsData; 
  };

  const mergeRoundHistory = (roundsHistoryParsed, roundData) => {
    const mergedRoundsHistory = _.merge(
        _.keyBy(roundsHistoryParsed, "round"),
        _.keyBy(roundData, "round")
      );
    return _.values(mergedRoundsHistory);
}

  const parseRoundDataFromSmartContract = (round, data) => {
    const closePrice = data.closePrice;
    const lockPrice = data.lockPrice;
    const bullAmount = data.bullAmount;
    const bearAmount = data.bearAmount;
    const totalAmount = new Big(data.totalAmount);
    let bullPayout, bearPayout = 0;
    try {  
      bullPayout = totalAmount.div(bullAmount).round(3).toString();
      bearPayout = totalAmount.div(bearAmount).round(3).toString();
    } catch (e) {
      console.log(e)
    }
    const parsedRound = [
      {
        round: round.toString(),
        openPrice: utils.formatUnits(data.lockPrice, "8"),
        closePrice: utils.formatUnits(data.closePrice, "8"),
        bullAmount: utils.formatUnits(data.bullAmount, "18"),
        bearAmount: utils.formatUnits(data.bearAmount, "18"),
        bullPayout: bullPayout,
        bearPayout: bearPayout,
        winner: closePrice.gt(lockPrice) ? BET_UP : BET_DOWN
      },
    ];
    return parsedRound;
  }

  const getNewStatistics = (roundHistoryData, cryptoUSDPrice) => {
    let totalEarnings = 0;
    let roundEarnings = 0;
    let win = 0;
    let loss = 0;
    if (roundHistoryData) {
      roundHistoryData.filter((round) => round.bet && round.winner).forEach((roundBetted) => {    
        const betAmount = parseFloat(roundBetted.betAmount);   
        if(roundBetted.bet == roundBetted.winner) {
          win++; 
          const bullPayout = parseFloat(roundBetted.bullPayout);
          const bearPayout = parseFloat(roundBetted.bearPayout);
          roundEarnings = roundBetted.winner == BET_UP ? (betAmount * bullPayout - betAmount) : (betAmount * bearPayout - betAmount);
          totalEarnings += roundEarnings;
        } else {
          loss++;
          totalEarnings -= betAmount;
        }
      });
    }
    const percentage = -percentageChange(win + loss, loss);
    return {
      profit_usd: totalEarnings * cryptoUSDPrice,
      profit_crypto: totalEarnings,
      percentage: (isNaN(percentage) ? 0 : percentage) + " %",
      win: win,
      loss: loss
    };
}

  module.exports = {
    generateFilePath,
    saveRoundInHistory,
    parseRoundDataFromSmartContract,
    saveStatisticsInHistory,
    getStatisticFromHistory,
    getNewStatistics
};
