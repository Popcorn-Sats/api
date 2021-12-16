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
    await db.address.update( // FIXME: will this override existing addresses with empty data on subsequent account add
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