const {getBlockHeader} = require('../services/electrum')

const blockHeight = process.argv[2];

(async() => {
  console.log({blockHeight});
  const result = await getBlockHeader(blockHeight)
  console.log({result});
})();
