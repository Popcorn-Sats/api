/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const { getObjects } = require('../utils/getObjects')

module.exports.getAllCategories = async () => {
  const categories = await db.category.findAll({
    attributes: {
        include: [
            [
                // Something weird going on below where Sequelize makes transaction.categoryId all lowercase. Had to change the column name ...
                Sequelize.literal(`(
                    SELECT SUM(balance_change)
                    FROM transactions AS transaction
                    WHERE
                        transaction.categoryId = category.id
                )`),
                'balance'
            ]
        ]
    },
    order: [
        ['name', 'ASC'],
    ]
  })
  if (!categories) {
    return { failed: true, message: "No categories were found" }
  }
  return categories
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