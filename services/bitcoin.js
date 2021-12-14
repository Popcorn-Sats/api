/* eslint-disable no-console */
const Bitcoin = require('bitcoinjs-lib')
/* const { addressFromExtPubKey, addressesFromExtPubKey } = require('@swan-bitcoin/xpub-lib')
const { Purpose } = require('@swan-bitcoin/xpub-lib/lib/purpose') */
const { addressFromExtPubKey, addressesFromExtPubKey } = require('../xpub-tool/packages/xpub-lib/src/derivation')
const { Purpose } = require('../xpub-tool/packages/xpub-lib/src/purpose')

module.exports.getScriptHash = (address) => {
  const script = Bitcoin.address.toOutputScript(address)
  const hash = Bitcoin.crypto.sha256(script)
  const reversedHash = hash.reverse().toString('hex')

  console.log(address, ' maps to ', reversedHash)
  return reversedHash
}

module.exports.getBlockTimestamp = (blockhex) => {
  const block = Bitcoin.Block.fromHex(blockhex)
  return block.timestamp
}

module.exports.getAddressFromXpub = (extPubKey, keyIndex, purpose, change, accountNumber) => {

  // Purpose can be: `P2PKH` (m / 44' /), `P2SH` (m / 49' /), `P2WPKH` (m / 84' /)

  const address = addressFromExtPubKey({
    extPubKey,
    accountNumber: accountNumber || 0,
    change: change || 0,
    keyIndex,
    purpose: Purpose[purpose],
    network: "mainnet",
  })

  return address
}

module.exports.getAddressesFromXpub = (extPubKey, addressCount, purpose, keyIndex, accountNumber, change) => {
  
  const address = addressesFromExtPubKey({
    extPubKey,
    addressCount,
    accountNumber: accountNumber || 0,
    change: change || 0,
    keyIndex,
    purpose: Purpose[purpose],
    network: "mainnet",
  })

  return address
}
