/**
 * @Module 
 * @author luca.musarella
 */

const {ethers} = require('ethers');

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
  
module.exports = {
    formatEther,
    parseEther,
    reduceWaitingTimeByTwoBlocks,
    percentage,
    percentageChange
};