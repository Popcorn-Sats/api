/* eslint-disable no-console */
const {checkAndCreateAddress} = require('../services/address')

const address = process.argv[2];
const accountId = process.argv[3];
const txIndex = process.argv[4];
const chain = process.argv[5];

(async() => {
  console.log({address});
  const result = await checkAndCreateAddress(address, accountId, txIndex, chain)
  console.log({result});
})();
