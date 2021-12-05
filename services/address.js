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
    // TODO: check if needs to be updated (i.e. might be syncing a new account that has transfers to other owned accounts)
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
  // TODO: electrum.getAddress then return transaction count
  return addressId
}

module.exports = {
  checkAndCreateAddress
}