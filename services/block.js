/* eslint-disable camelcase */
/* eslint-disable no-console */
const db = require('../models')

// TODO: check if lodash has something for this; if not, move to utils
// Helper function to return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
  let objects = [];
  for (const i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] === 'object') {
          objects = objects.concat(getObjects(obj[i], key, val));    
      } else 
      // if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
      // this seems to be duplicating the object ...
      if (i === key && obj[i] === val || i === key && val === '') { //
          objects.push(obj);
      } else if (obj[i] === val && key === ''){
          // only add if the object is not already in the array
          if (objects.lastIndexOf(obj) === -1){
              objects.push(obj);
          }
      }
  }
  return objects;
}

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