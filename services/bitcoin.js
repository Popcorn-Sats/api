/* eslint-disable no-console */
const Bitcoin = require('bitcoinjs-lib')

module.exports.getScriptHash = (address) => {
  const script = Bitcoin.address.toOutputScript(address)
  const hash = Bitcoin.crypto.sha256(script)
  const reversedHash = hash.reverse().toString('hex')

  console.log(address, ' maps to ', reversedHash)
  return reversedHash
}

module.exports.getAddressFromXpub = (xpub, chain, addressIndex) => {
  // m / purpose' / coin_type' / account' / change / address_index

    const path = `${chain}/${addressIndex}`
    const node = Bitcoin.bip32.fromBase58(xpub).derivePath(path)
    const {address} = Bitcoin.payments.p2pkh({ pubkey: node.publicKey })

    console.log(`The address at index ${addressIndex} is ${address}`)
    return address
  }
