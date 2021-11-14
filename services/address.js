const db = require('../models')

module.exports.checkAndCreateAddress = async (address, accountId) => {
  let addressId
  const errors = []
  const addresses = await db.address.findAll({
    where: {
      address
    }
  })
  if (addresses[0]) {
    addressId = addresses[0].dataValues.id
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