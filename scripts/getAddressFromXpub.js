const {getAddressFromXpub} = require('../services/bitcoin')

const xpub = process.argv[2];
const chain = process.argv[3];
const addressIndex = process.argv[4];

(async() => {
  console.log({xpub});
  const result = await getAddressFromXpub(xpub, chain, addressIndex)
  console.log({result});
})();
