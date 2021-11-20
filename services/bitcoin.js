const Bitcoin = require('bitcoinjs-lib')

module.exports.getScriptHash = (address) => {
  const script = Bitcoin.address.toOutputScript(address)
  const hash = Bitcoin.crypto.sha256(script)
  const reversedHash = hash.reverse().toString('hex')

  console.log(address, ' maps to ', reversedHash)
  return reversedHash
}