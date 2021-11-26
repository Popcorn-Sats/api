const {getAddressFromXpub} = require('../services/bitcoin')

const xpub = process.argv[2];
const chain = process.argv[3];
const addressIndex = process.argv[4];
const purpose = process.argv[5];

// Purpose can be: `p2pkh` (m / 44' /), `p2wpkh` (m / 84' /)

(async() => {
  console.log({xpub});
  const result = await getAddressFromXpub(xpub, chain, addressIndex, purpose)
  console.log({result});
})();
