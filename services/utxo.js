const db = require('../models')

module.exports.checkAndCreateUtxo = async (utxo, addressId) => {
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
