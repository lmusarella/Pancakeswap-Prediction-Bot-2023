/**
 * Module that exposes the writing and reading functions of the generated files, useful for saving data during the execution of the bot
 * @Module 
 * @author luca.musarella
 */
const _ = require("lodash");
const { BET_UP } = require("../common/constants/bot.constants");
const { writeOrUpdateFile, getFileJsonContent, percentageChange, getCrypto, parseFromCryptoToUsd, parseFeeFromCryptoToUsd, createDir, getStringDate, deleteFile } = require('../common/utils.module');


/**
 * files name definition
 * @date 4/25/2023 - 3:53:02 PM
 *
 * @type {string}
 */
const ROUND_HISTORY_FILENAME = `${getCrypto().toLowerCase()}-game/rounds-data/rounds-played-history`;
const ALL_ROUND_HISTORY_FILENAME = `${getCrypto().toLowerCase()}-game/rounds-data/rounds-history`;
const STATISTICS_FILENAME = `${getCrypto().toLowerCase()}-game/statistics-data/statistics-history`;
const USERS_ACTIVITY_FILENAME = `${getCrypto().toLowerCase()}-game/users-data/users-activity`;

/**
 * inherit
 * @date 4/25/2023 - 3:53:02 PM
 *
 * @param {string} fileName
 * @returns {string}
 */
const generateFilePath = (fileName) => {
  return getFilePath(`${fileName}`);
};

/**
 * Generate the complete file path from the filename passed in input
 * @date 4/25/2023 - 3:53:02 PM
 *
 * @param {string} fileName
 * @returns {string}
 */
const getFilePath = (fileName) => {
  return `./bot-history/${fileName}.json`;
};

/**
 * Recover the data of an already saved file, try to merge the content and rewrite a new updated file
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @async
 * @param {string} path - file path
 * @param {any} newData -  new data to merge
 * @returns {any} - file content
 */
const saveRoundDataInHistory = async (path, newData) => {
  const data = await getFileJsonContent(path);
  if (data) {
    let mergedData;
    try {
      mergedData = mergeRoundData(data, newData);
    } catch (e) {
      console.log(e);
      return;
    }
    return writeOrUpdateFile(path, mergedData);
  } else {
    return writeOrUpdateFile(path, newData);
  }
}

/**
 * Generate the path of round data and save/update the file with the usersData
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @async
 * @param {any} roundData - util round data
 * @returns {any} - file content
 */
const saveRoundInHistory = async (roundData, fileName) => {
  const path = generateFilePath(fileName ? fileName : ROUND_HISTORY_FILENAME);
  return await saveRoundDataInHistory(path, roundData);
};

/**
 * Retrieve current rounds data from history
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @async
 * @returns {any} - file content
 */
const getRoundsFromHistory = async (fileName) => {
  const path = generateFilePath(fileName ? fileName : ROUND_HISTORY_FILENAME);
  const roundsHistory = await getFileJsonContent(path);
  return roundsHistory;
}

/**
 * Retrieve current rounds statistics data from history
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @async
 * @returns {any} - file content
 */
const getStatisticFromHistory = async () => {
  const path = generateFilePath(STATISTICS_FILENAME);
  const statisticsHistory = await getFileJsonContent(path);
  return statisticsHistory;
}

/**
 * Retrieve current users activity data from history
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @async
 * @returns {any} - file content
 */
const getUserActivityFromHistory = async () => {
  const path = generateFilePath(USERS_ACTIVITY_FILENAME);
  const userActivityHistory = await getFileJsonContent(path);
  return userActivityHistory ? userActivityHistory : {};
}

/**
 * Retrieve current round users data from history
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @async
 * @returns {any} - file content
 */
const getRoundUsersFromHistory = async () => {
  const path = generateFilePath(USERS_ROUNDS_FILENAME);
  const usersRoundHistory = await getFileJsonContent(path);
  return usersRoundHistory;
}

/**
 * Generate the path of user activity file and save the file with the userActivityData
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @param {any} userActivity - util user activity data
 * @returns {any} - file content
 */
const saveUserActivityInHistory = (userActivity) => {
  const path = generateFilePath(USERS_ACTIVITY_FILENAME);
  return writeOrUpdateFile(path, userActivity);
};

/**
 * Generate the path of statistic file, generate the new statistic data from round history and save the file with the statisticsData
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @param {any} roundHistoryData - util rounds history data
 * @returns {any} - file content
 */
const saveStatisticsInHistory = (roundHistoryData) => {
  const statisticsData = generateNewStatistics(roundHistoryData);
  const path = generateFilePath(STATISTICS_FILENAME);
  return writeOrUpdateFile(path, statisticsData);
};

/**
 * Merge new round data
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @param {any} roundsDataParsed - current round data
 * @param {any} newRoundData - new round data
 * @returns {any} - merged values
 */
const mergeRoundData = (roundsDataParsed, newRoundData) => {
  const mergedRoundsData = _.merge(
    _.keyBy(roundsDataParsed, "round"),
    _.keyBy(newRoundData, "round")
  );
  return _.values(mergedRoundsData);
}

/**
 * Create a backup folder and save the current history
 * @date 4/25/2023 - 3:53:01 PM
 *
 */
const backUpFilesHistory = async () => {
    const dirPath = `./bot-history/${getCrypto().toLowerCase()}-game/backup/${getStringDate()}-backup/`;

    const exist = createDir(dirPath);

    if(!exist) {
      return;
    }
    
    const roundPlayedHistory = await getRoundsFromHistory();
    const allRoundsHistory = await getRoundsFromHistory(ALL_ROUND_HISTORY_FILENAME);
    const statistics = await getStatisticFromHistory();
    const usersActivity = await getUserActivityFromHistory();

    if(roundPlayedHistory)
    writeOrUpdateFile(dirPath + "rounds-played.json", roundPlayedHistory);
    if(allRoundsHistory)
    writeOrUpdateFile(dirPath + "all-rounds.json", allRoundsHistory);
    if(statistics)
    writeOrUpdateFile(dirPath + "statistics.json", statistics);
    if(usersActivity && Object.keys(usersActivity).length)
    writeOrUpdateFile(dirPath + "user-activity.json", usersActivity);
}
/**
 * Delete the current history
 * @date 4/25/2023 - 3:53:01 PM
 *
 */
const resetFilesHistory = () => {
    deleteFile(generateFilePath(ROUND_HISTORY_FILENAME));
    deleteFile(generateFilePath(STATISTICS_FILENAME));
    deleteFile(generateFilePath(USERS_ACTIVITY_FILENAME));
    deleteFile(generateFilePath(ALL_ROUND_HISTORY_FILENAME));
}

/**
 * Calculate end-of-round stats, taking in all previous rounds. By calculating profits, losses, wins and fees spent and other data
 * @date 4/25/2023 - 3:53:01 PM
 *
 * @param {any} roundHistoryData - all current history data
 * @returns {{ profit_usd: number; profit_crypto: number; percentage: number; win: number; loss: number; betErrors: number; totalTxGasFee: number; totalTxGasFeeUsd: number; }}
 */
const generateNewStatistics = (roundHistoryData) => {
  let totalEarnings = 0;
  let roundEarnings = 0;
  let win = 0;
  let loss = 0;
  let betErrorTransactions = 0;
  let totalTxGasFee = 0;
  if (roundHistoryData) {
    roundHistoryData.filter((round) => round.bet && round.winner).forEach((roundBetted) => {
      const betAmount = roundBetted.betAmount;
      totalTxGasFee += roundBetted.txGasFee + roundBetted.txClaimGasFee;
      if (!roundBetted.betExecuted) {
        betErrorTransactions++
      } else {
        if (roundBetted.bet == roundBetted.winner) {
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
    betErrors: betErrorTransactions,
    totalTxGasFee: totalTxGasFee,
    totalTxGasFeeUsd: parseFeeFromCryptoToUsd(totalTxGasFee)
  };
}

module.exports = {
  ALL_ROUND_HISTORY_FILENAME,
  generateFilePath,
  mergeRoundData,
  saveRoundInHistory,
  getRoundUsersFromHistory,
  getRoundsFromHistory,
  saveStatisticsInHistory,
  getStatisticFromHistory,
  saveUserActivityInHistory,
  getUserActivityFromHistory,
  backUpFilesHistory,
  resetFilesHistory
};
