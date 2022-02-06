/* eslint-disable no-console */
const db = require('../models')
const {getBlockHeader} = require('../services/electrum')
const {getBlockTimestamp} = require('../services/bitcoin')

const blockHeight = process.argv[2];

(async() => {
  console.log({blockHeight});
  const blockhex = await getBlockHeader(blockHeight)
  console.log({blockhex});
  const timestamp = await getBlockTimestamp(blockhex)
  console.log({timestamp});

  let block
  const errors = []
  const blockObj = await db.block.findOne({
    where: {
      height: blockHeight
    }
  })
  if (blockObj) {
    await db.block.update({
      timestamp
    }, {
      where: {
        height: blockHeight
      }
    })
    .catch(err => {
      errors.push(err)
      console.log({ errors })
      return errors
    })
    block = await db.block.findOne({
      where: {
        height: blockHeight
      }
    })
  } else {
    console.error({ msg: "no block found" })
  }
  console.log({ "edited block": block.dataValues })
  return block.dataValues
})();