const {getAddress} = require('../services/electrum')

const address = process.argv[2];

(async() => {
  console.log({address});
  const result = await getAddress(address)
  console.log({result});
})();
