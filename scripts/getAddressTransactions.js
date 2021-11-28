/* eslint-disable no-console */
const {getAddressTransactions} = require('../services/electrum')

const address = process.argv[2];

(async() => {
  console.log({address});
  const result = await getAddressTransactions(address)
  console.log({result});
})();
