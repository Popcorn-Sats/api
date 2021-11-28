/* eslint-disable no-console */
const {getAddressesFromXpub} = require('../services/bitcoin')

const extPubKey = process.argv[2];
const addressCount = process.argv[3];
const purpose = process.argv[4];
const keyIndex = process.argv[5];
const accountNumber = process.argv[6];

// Purpose can be: `P2PKH` (m / 44' /), `P2SH` (m / 49' /), `P2WPKH` (m / 84' /)

(async() => {
  console.log({extPubKey});
  const result = await getAddressesFromXpub(extPubKey, addressCount, purpose, keyIndex, accountNumber)
  console.log({result});
})();
