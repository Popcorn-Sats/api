const db = require('../models')
const {getBlockTimestamp} = require('./bitcoin')
const {getBlockHeader} = require('./electrum')

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
    const blockhex = await getBlockHeader(blockHeight)
    const newBlock = await db.block.create({
      height: blockHeight,
      timestamp: getBlockTimestamp(blockhex)
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
    blockId = newBlock.dataValues.id
  }
  return blockId
}