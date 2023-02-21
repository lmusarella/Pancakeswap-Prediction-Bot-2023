/**
 * @Module 
 * @author luca.musarella
 */
const _ = require("lodash");
const { BET_UP} = require("../common/constants/bot.constants");
const { writeOrUpdateFile, getFileJsonContent, percentageChange, getCrypto, parseFromCryptoToUsd} = require('../common/utils.module');

const ROUND_HISTORY_FILENAME = `rounds-${getCrypto().toLowerCase()}-history`;
const STATISTICS_FILENAME = `statistics-${getCrypto().toLowerCase()}-history`;

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

  const saveRoundInHistory = async (roundData) => {
    const path = generateFilePath(ROUND_HISTORY_FILENAME);
    const roundsHistoryParsed = await getFileJsonContent(path);
    if (roundsHistoryParsed) {
          let mergedRoundsHistory;
          try {        
            mergedRoundsHistory = mergeRoundHistory(roundsHistoryParsed, [roundData]);
          } catch (e) {
            console.log(e);
            return;
          }      
          writeOrUpdateFile(path, mergedRoundsHistory);
          return mergedRoundsHistory;  
      } else {       
        writeOrUpdateFile(path, [roundData]);
        return [roundData]; 
      }
  };

  const getStatisticFromHistory = async () => {
    const path = generateFilePath(STATISTICS_FILENAME);
    const statisticsHistoryParsed = await getFileJsonContent(path);
    return statisticsHistoryParsed;
  }

  const saveStatisticsInHistory = (roundHistoryData) => {
    const statisticsData = generateNewStatistics(roundHistoryData);
    const path = generateFilePath(STATISTICS_FILENAME);
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

  const generateNewStatistics = (roundHistoryData) => {
    let totalEarnings = 0;
    let roundEarnings = 0;
    let win = 0;
    let loss = 0;
    let betErrorTransactions = 0
    if (roundHistoryData) {
      roundHistoryData.filter((round) => round.bet && round.winner).forEach((roundBetted) => {    
        const betAmount = roundBetted.betAmount; 
        if(!roundBetted.betExecuted) {
          betErrorTransactions++
        } else {
          if(roundBetted.bet == roundBetted.winner) {
            win++; 
            const bullPayout = roundBetted.bullPayout;
            const bearPayout = roundBetted.bearPayout;
            roundEarnings = roundBetted.winner == BET_UP ? (betAmount * bullPayout - betAmount) : (betAmount * bearPayout - betAmount);
            totalEarnings += roundEarnings;
          } else {
            loss++;
            totalEarnings -= betAmount;
          }
        }
      });
    }
    const percentage = -percentageChange(win + loss, loss);
    return {
      profit_usd: parseFromCryptoToUsd(totalEarnings),
      profit_crypto: totalEarnings,
      percentage: isNaN(percentage) ? 0 : percentage,
      win: win,
      loss: loss,
      betErrors: betErrorTransactions
    };
}

  module.exports = {
    generateFilePath,
    saveRoundInHistory,
    saveStatisticsInHistory,
    getStatisticFromHistory
};
