const db = require('../models')
const { checkAndCreateAddress } = require('./address')

module.exports.checkAndCreateUtxo = async (utxo, address, accountId) => {
  let utxoId
  const errors = []
  const utxoObj = await db.utxo.findOne({
    where: {
      utxo
    }
  })
  if (utxoObj) {
    utxoId = utxoObj.dataValues.id
  } else {
    const addressId = await checkAndCreateAddress(address, accountId)
    const newUtxo = await db.utxo.create({
      utxo,
      addressId
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
    utxoId = newUtxo.dataValues.id
  }
  return utxoId
}