const db = require('../models')

const checkAndCreateAddress = async (address, accountId, txIndex, chain) => {
  let addressId
  const errors = []
  const addressObj = await db.address.findOne({
    where: {
      address
    }
  })
  if (addressObj) {
    if (address && accountId && txIndex && chain) {
      await db.address.update(
        {
          accountId,
          txIndex,
          chain
        }, {
          where: {
            address
          }
        }
      )
    }
    addressId = addressObj.dataValues.id
  } else {
    const newAddress = await db.address.create({
      address,
      accountId,
      txIndex,
      chain
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
    addressId = newAddress.dataValues.id
  }
  return addressId
}

module.exports = {
  checkAndCreateAddress
}