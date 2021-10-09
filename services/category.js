/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const { getObjects } = require('../utils/getObjects')

const {Op} = Sequelize

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

module.exports.editCategoryById = async (category) => {
  const { id, name } = category 
  const errors = []

  db.category.update(
    { 
        name
    }, {
        where: {
            id
        }
    }
  )

  .catch(err => {
    errors.push(err)
    // res(errors)
    // console.log(err)
  })
  return category
}

module.exports.createCategory = async (category) => {
  const { name } = category
  const errors = []
  const newCategory = await db.category.create({
    name
  })

  .catch(err => {
    errors.push(err)
  })
  return newCategory

    /* // Validate fields
    if(!name) {
        res.status(400).send()
    }

    // Check for  errors
    if(errors.length > 0) {
        res.send('add', {
            errors,
            name
        })
    } else {
        // Insert into table
        db.category.create({
            name
        })
        .then(category => res.json(category))
        .catch(err => console.log(err));
    } */
}

// FIXME: Doesn't work
module.exports.searchAllCategories = async (term) => {
  // How to make this case-agnostic without making everything lowercase?
  const errors = []
  const result = db.category.findAll({ where: Sequelize.or(
    { name: { [Op.like]: '%' + term + '%' } }
  )})
  .catch(err => {
    errors.push(err)
  })
  return(result)
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