/* eslint-disable no-console */
const {getAddressTransactions} = require('../services/electrum')

const address = process.argv[2];

(async() => {
  console.log({address});
  const result = await getAddressTransactions(address)
  console.log({result});
  for (let i = 0; i < result.length; i += 1) {
    console.log({vin: result[i].vin})
    console.log({vout: result[i].vout})
  }
})();
