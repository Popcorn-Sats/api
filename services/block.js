/* eslint-disable camelcase */
/* eslint-disable no-console */
const db = require('../models')
const { getObjects } = require('../utils/getObjects')

// FIXME: This is just adding new blocks each time, not returning if already exists
module.exports.checkAndCreateBlock = async (blockHeight) => {
  let blockId
  let blockMatch
  let blockIndex
  await db.block.findAll({
    order: [
        ['id', 'ASC'],
    ],
  })
  .then(blocks => {
      blockIndex = blocks[blocks.length -1].dataValues.id + 1
      blockMatch = getObjects(blocks, '', blockHeight)
  })
  if (blockMatch[0]) {
      blockId = blockMatch[0].id
  }
  else {
      // Insert into table
      db.block.create({
          id: blockIndex,
          height: blockHeight
      })
      .then(
          block => {
              // console.log(block)
              blockId = block.id
          }
      )
      .catch(err => console.log(err));
  }
  return blockId
}