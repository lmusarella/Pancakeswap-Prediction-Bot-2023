/**
 * @Module 
 * @author luca.musarella
 */
const _ = require("lodash");
const { BET_UP } = require("../common/constants/bot.constants");
const { writeOrUpdateFile, getFileJsonContent, percentageChange, getCrypto, parseFromCryptoToUsd, parseFeeFromCryptoToUsd } = require('../common/utils.module');

const ROUND_HISTORY_FILENAME = `${getCrypto().toLowerCase()}-game/rounds-${getCrypto().toLowerCase()}-history`;
const STATISTICS_FILENAME = `${getCrypto().toLowerCase()}-game/statistics-${getCrypto().toLowerCase()}-history`;
const ROUNDS_USERS__FILENAME = `${getCrypto().toLowerCase()}-game/rounds-${getCrypto().toLowerCase()}-users`;
const USERS_ACTIVITY_FILENAME = `${getCrypto().toLowerCase()}-game/users-${getCrypto().toLowerCase()}-activity`;

const generateFilePath = (fileName) => {
  return getFilePath(`${fileName}`);
};

const getFilePath = (fileName) => {
  return `./bot-history/${fileName}.json`;
};

const saveRoundUsersInHistory = async (usersData, forceUpdate) => {
  const path = generateFilePath(ROUNDS_USERS__FILENAME);
  return forceUpdate ? writeOrUpdateFile(path, usersData) : await saveRoundDataInHistory(path, usersData);
};

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

const saveRoundInHistory = async (roundData, forceUpdate) => {
  const path = generateFilePath(ROUND_HISTORY_FILENAME);
  return forceUpdate ? writeOrUpdateFile(path, roundData) : await saveRoundDataInHistory(path, roundData)
};

const getRoundsFromHistory = async () => {
  const path = generateFilePath(ROUND_HISTORY_FILENAME);
  const roundsHistory = await getFileJsonContent(path);
  return roundsHistory;
}

const getStatisticFromHistory = async () => {
  const path = generateFilePath(STATISTICS_FILENAME);
  const statisticsHistory = await getFileJsonContent(path);
  return statisticsHistory;
}

const getUserActivityFromHistory = async () => {
  const path = generateFilePath(USERS_ACTIVITY_FILENAME);
  const userActivityHistory = await getFileJsonContent(path);
  return userActivityHistory ? userActivityHistory : {};
}

const getRoundUsersFromHistory = async () => {
  const path = generateFilePath(USERS_ROUNDS_FILENAME);
  const usersRoundHistory = await getFileJsonContent(path);
  return usersRoundHistory;
}

const saveUserActivityInHistory = (userActivity) => {
  const path = generateFilePath(USERS_ACTIVITY_FILENAME);
  return writeOrUpdateFile(path, userActivity);
};

const saveStatisticsInHistory = (roundHistoryData) => {
  const statisticsData = generateNewStatistics(roundHistoryData);
  const path = generateFilePath(STATISTICS_FILENAME);
  return writeOrUpdateFile(path, statisticsData);
};

const mergeRoundData = (roundsDataParsed, newRoundData) => {
  const mergedRoundsData = _.merge(
    _.keyBy(roundsDataParsed, "round"),
    _.keyBy(newRoundData, "round")
  );
  return _.values(mergedRoundsData);
}

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
  generateFilePath,
  mergeRoundData,
  saveRoundInHistory,
  saveRoundUsersInHistory,
  getRoundUsersFromHistory,
  getRoundsFromHistory,
  saveStatisticsInHistory,
  getStatisticFromHistory,
  saveUserActivityInHistory,
  getUserActivityFromHistory
};
