const db = require('../models')

module.exports.checkAndCreateBlock = async (blockHeight) => {
  let blockId
  const errors = []
  const blocks = await db.block.findAll({
    where: {
        height: blockHeight
      }
    }
  )
  if (blocks[0]) {
    blockId = blocks[0].dataValues.id
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