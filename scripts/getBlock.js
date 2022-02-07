/* eslint-disable no-console */
const {getBlockTimestamp} = require('../services/bitcoin')

const blockhex = process.argv[2];

(async() => {
  console.log({blockhex});
  const result = await getBlockTimestamp(blockhex)
  console.log({result});
})();
