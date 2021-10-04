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

module.exports.checkAndCreateCategory = async (category) => {
  let categoryid
  let categoryMatch
  let categoryIndex
  await db.category.findAll({
    order: [
        ['id', 'ASC'],
    ],
  })
  .then(categories => {
      // Need to get the next index manually as it's defined in the model TODO: helper function to DRY
      // TODO: This is overengineered. Should be able to get category where name === category
      // TODO: index should autoincrement
      categoryIndex = categories[categories.length -1].dataValues.id + 1
      categoryMatch = getObjects(categories, '', category)
      if (categoryMatch[0]) {
          categoryid = categoryMatch[0].id // TODO: Fix duplicate object bug in getObjects script above
      }
      else {
          // Insert into table
          db.category.create({
              id: categoryIndex,
              name: category
          })
          .then(
              newCategory => {
                  // console.log(category)
                  categoryid = newCategory.id
              }
          )
          .catch(err => console.log(err));
      }
  })
  .catch(err => console.log(err));
  return categoryid
}