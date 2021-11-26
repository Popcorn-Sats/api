/* eslint-disable no-console */
const Bitcoin = require('bitcoinjs-lib')

module.exports.getScriptHash = (address) => {
  const script = Bitcoin.address.toOutputScript(address)
  const hash = Bitcoin.crypto.sha256(script)
  const reversedHash = hash.reverse().toString('hex')

  console.log(address, ' maps to ', reversedHash)
  return reversedHash
}

module.exports.getAddressFromXpub = (xpub, chain, addressIndex, purpose) => {
  // m / purpose' / coin_type' / account' / change / address_index

  /* Purpose can be: 
    - `p2pkh` (m / 44' /) address beginning 1
    - `p2wpkh` (m / 84' /) address beginning bc1 */

    const path = `${chain}/${addressIndex}`
    const node = Bitcoin.bip32.fromBase58(xpub).derivePath(path)

    const {address} = Bitcoin.payments[purpose]({ pubkey: node.publicKey })

    return address
  }
