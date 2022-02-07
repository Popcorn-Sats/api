/* eslint-disable no-console */
const {getAddress, initiate} = require('../services/electrum')

const address = process.argv[2];

(async() => {
  initiate()
  console.log({address});
  const result = await getAddress(address)
  console.log({result});
})();
