/**
 * @Module 
 * @author luca.musarella
 */

const fs = require('fs');
const _ = require("lodash");
const Big = require("big.js");
const {utils} = require('ethers');

const getHistoryFileName = () => {
    const date = new Date();
    const day = date.getDate();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}${month}${day}`;
  };

const getHistory = async (fileName) => {
    let history = fileName ? fileName : getHistoryFileName();
    let path = `./bot-history/${history}.json`;
    try {
      if (fs.existsSync(path)) {
        let history, historyParsed;
        try {
          history = fs.readFileSync(path);
          historyParsed = JSON.parse(history);
        } catch (e) {
          console.log("Error reading history:", e);
          return;
        }
        return historyParsed;
      } else {
        return;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveRoundInHistory = async (roundData) => {
    const historyName = getHistoryFileName();
    const path = `./bot-history/${historyName}.json`;
    try {
      if (fs.existsSync(path)) {
          let updated, history, merged, historyParsed;
          try {
            history = fs.readFileSync(path);
            historyParsed = JSON.parse(history);
            merged = _.merge(
              _.keyBy(historyParsed, "round"),
              _.keyBy(roundData, "round")
            );
            updated = _.values(merged);
          } catch (e) {
            console.log(e);
            return;
          }      
          fs.writeFileSync(path, JSON.stringify(updated), "utf8");
          return updated;  
      } else {       
        fs.writeFileSync(path, JSON.stringify(roundData), "utf8");
        return roundData; 
      }
    } catch (err) {
      console.error(err);
    }
  };

  const parseRoundDataFromSmartContract = (round, data) => {
    const closePrice = data.closePrice;
    const lockPrice = data.lockPrice;
    const bullAmount = data.bullAmount;
    const bearAmount = data.bearAmount;
    const totalAmount = new Big(data.totalAmount);
    const bullPayout = totalAmount.div(bullAmount).round(3).toString();
    const bearPayout = totalAmount.div(bearAmount).round(3).toString();
    const parsedRound = [
      {
        round: round.toString(),
        openPrice: utils.formatUnits(data.lockPrice, "8"),
        closePrice: utils.formatUnits(data.closePrice, "8"),
        bullAmount: utils.formatUnits(data.bullAmount, "18"),
        bearAmount: utils.formatUnits(data.bearAmount, "18"),
        bullPayout: bullPayout,
        bearPayout: bearPayout,
        winner: closePrice.gt(lockPrice) ? "bull" : "bear",
      },
    ];

    console.log('round data ', parsedRound);
    return parsedRound;
  }

  module.exports = {
    getHistoryFileName,
    getHistory,
    saveRoundInHistory,
    parseRoundDataFromSmartContract
};
