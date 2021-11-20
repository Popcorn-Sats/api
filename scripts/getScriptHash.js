const {getScriptHash} = require('../services/bitcoin')

const address = process.argv[2];

(async() => {
  console.log({address});
  const result = await getScriptHash(address)
  console.log({result});
})();
