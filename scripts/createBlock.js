/* eslint-disable no-console */
const {checkAndCreateBlock} = require('../services/block')

const blockHeight = process.argv[2];

(async() => {
  console.log({blockHeight});
  const result = await checkAndCreateBlock(blockHeight)
  console.log({result});
})();
