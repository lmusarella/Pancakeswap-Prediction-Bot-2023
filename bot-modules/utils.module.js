/**
 * @Module 
 * @author luca.musarella
 */
const {ethers} = require('ethers');
const fs = require('fs');

const formatEther = (amount) => {
    return ethers.utils.formatEther(amount) 
};

const parseEther = (amount) => {
    return ethers.utils.parseEther(amount, 'ether');
};

const reduceWaitingTimeByTwoBlocks = (waitingTime) => {
    if (waitingTime <= 6000) {
      return waitingTime;
    }
    return waitingTime - 6000;
};

const percentage = (a, b) => {
    return parseInt((100 * a) / (a + b));
};

const percentageChange = (a, b) => {
    return ((b - a) * 100) / a;
};

const writeOrUpdateFile = (path, jsonFileContent) => {
    fs.writeFileSync(path, JSON.stringify(jsonFileContent), "utf8");
}

const getFileJsonContent = async (path) => {
    try {
      if (fs.existsSync(path)) {
        let contentJsonFile;
        try {
          contentJsonFile = JSON.parse(fs.readFileSync(path));
        } catch (e) {
          console.log("Error reading contentJsonFile:", e);
          return;
        }
        return contentJsonFile;
      } else {
        return;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stopBotCommand = () => {
    console.log(`--------------------------------`);
    console.log(`🔴 Bot stopped`);
    console.log(`--------------------------------`);
    process.exit();
  }
  
module.exports = {
    formatEther,
    parseEther,
    reduceWaitingTimeByTwoBlocks,
    percentage,
    percentageChange,
    writeOrUpdateFile,
    getFileJsonContent,
    stopBotCommand
};