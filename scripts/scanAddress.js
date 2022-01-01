/* eslint-disable no-console */
const {scanAddress} = require('../services/account')

const addressId = process.argv[2];

(async() => {
  console.log({addressId});
  const result = await scanAddress(addressId)
  console.log({result});
})();
