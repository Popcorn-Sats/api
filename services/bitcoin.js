/* eslint-disable no-console */
const Bitcoin = require('bitcoinjs-lib')
const { addressFromExtPubKey, addressesFromExtPubKey } = require('@swan-bitcoin/xpub-lib')
const { Purpose } = require('@swan-bitcoin/xpub-lib/lib/purpose')

module.exports.getScriptHash = (address) => {
  const script = Bitcoin.address.toOutputScript(address)
  const hash = Bitcoin.crypto.sha256(script)
  const reversedHash = hash.reverse().toString('hex')

  console.log(address, ' maps to ', reversedHash)
  return reversedHash
}

module.exports.getAddressFromXpub = (extPubKey, keyIndex, purpose, accountNumber) => {

  // FIXME: Need to define receive/change chain. Defaults to Receive
  // Purpose can be: `P2PKH` (m / 44' /), `P2SH` (m / 49' /), `P2WPKH` (m / 84' /)

  const address = addressFromExtPubKey({
    extPubKey,
    accountNumber: accountNumber || 0,
    keyIndex,
    purpose: Purpose[purpose],
    network: "mainnet",
  })

  return address
}

module.exports.getAddressesFromXpub = (extPubKey, addressCount, purpose, keyIndex, accountNumber) => {
  
  const address = addressesFromExtPubKey({
    addressCount,
    extPubKey,
    accountNumber: accountNumber || 0,
    keyIndex,
    purpose: Purpose[purpose],
    network: "mainnet",
  })

  return address
}


/* 
  Addresses using bitcoinjs:
  m / purpose' / coin_type' / account' / change / address_index
  Purpose can be: 
    - `p2pkh` (m / 44' /) address beginning 1
    - `p2wpkh` (m / 84' /) address beginning bc1
  const path = `${chain}/${addressIndex}`
  const node = Bitcoin.bip32.fromBase58(xpub).derivePath(path)
  const {address} = Bitcoin.payments[purpose]({ pubkey: node.publicKey })
  */