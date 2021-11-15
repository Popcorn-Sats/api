const db = require('../models')

module.exports.checkAndCreateBlock = async (blockHeight) => {
  let blockId
  const errors = []
  const blockObj = await db.block.findOne({
    where: {
      height: blockHeight
    }
  })
  if (blockObj) {
    blockId = blockObj.dataValues.id
  } else {
    const newBlock = await db.block.create({
      height: blockHeight
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
    blockId = newBlock.dataValues.id
  }
  return blockId
}