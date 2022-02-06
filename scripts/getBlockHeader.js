const {getBlockHeader, initiate} = require('../services/electrum')

const blockHeight = process.argv[2];

(async() => {
  initiate()
  console.log({blockHeight});
  const result = await getBlockHeader(blockHeight)
  console.log({result});
})();
