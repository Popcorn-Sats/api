/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')

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

module.exports.searchAllCategories = async (term) => {
  const errors = []
  const result = await db.category.findAll({ where: Sequelize.or(
    { name: { [Op.iLike]: `%${  term  }%` } }
  )})
  .catch(err => {
    errors.push(err)
  })
  return(result)
}

module.exports.checkAndCreateCategory = async (category) => {
  let categoryid
  const errors = []
  const categories = await db.category.findAll({
    where: {
      name: category
    }
  })
  if (categories[0]) {
    categoryid = categories[0].dataValues.id
  } else {
    const newCategory = await db.category.create({
      name: category
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
    categoryid = newCategory.dataValues.id
  }
  return categoryid
}