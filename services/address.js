const db = require('../models')

module.exports.checkAndCreateAddress = async (address, accountId) => {
  let addressId
  const errors = []
  const addressObj = await db.address.findOne({
    where: {
      address
    }
  })
  if (addressObj) {
    addressId = addressObj.dataValues.id
  } else {
    const newAddress = await db.address.create({
      address,
      accountId
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
    addressId = newAddress.dataValues.id
  }
  return addressId
}
