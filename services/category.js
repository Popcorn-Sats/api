/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const { getTransactionsByCategoryId } = require('./transactions/getTransactionsByCategoryID')
const db = require('../models')

const {Op} = Sequelize

const getAllCategories = async () => {
  const categories = await db.category.findAll({
    attributes: {
        include: [
            [
                // Something weird going on below where Sequelize makes transaction.categoryId all lowercase. Had to change the column name ...
                Sequelize.literal(`(
                    SELECT SUM(balance_change)
                    FROM transactions AS transaction
                    WHERE
                        transaction.categoryid = category.id
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

  for (let j = 0; j < categories.length; j += 1) {
    const transactions = await getTransactionsByCategoryId(categories[j].id)
    if (transactions.length !== 0) {
      categories[j].dataValues.balance = transactions[0].runningBalance
    }
  }

  return categories
}

module.exports.editCategoryById = async (category, id) => {
  const { name } = category 
  const errors = []

  // Validate required fields
  if(!id || !name) {
    return { failed: true, message: "Missing required field(s)" }
  }

  let editedCategory = await db.category.update(
    { 
        name
    }, {
        where: {
            id
        },
        returning: true
    }
  )
  .catch(err => {
    errors.push(err)
    return errors
  })

  if(!editedCategory) {
    return { failed: true, message: "Something went wrong—category wasn't edited", errors }
  }

  // FIXME: Refactor this file then call getCategoryById here
  editedCategory = await db.category.findOne({
    where: {
      id
    },
  })
  .catch(err => {
    errors.push(err)
    return errors
  })

  return editedCategory
}

module.exports.deleteCategoryById = async (id) => {
  const errors = []
  const deletedCategory = await db.category.destroy({
    where: {
      id
    },
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!deletedCategory) {
    return { failed: true, message: "No category was found" }
  }
  return deletedCategory
}

module.exports.getCategoryById = async (id) => {
  const errors = []
  const category = await db.category.findOne({
    where: {
      id
    },
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!category) {
    return { failed: true, message: "No category was found" }
  }

  return category
}

module.exports.createCategory = async (category) => {
  const { name } = category
  const errors = []

  // Validate fields
  if(!name) {
      return { failed: true, message: "No category name provided" }
  }

  const newCategory = await db.category.create({
    name
  })
  .catch(err => {
    errors.push(err)
    return errors
  })

  if(!newCategory) {
    return { failed: true, message: "Something went wrong—category wasn't created", errors }
  }

  return newCategory

}

module.exports.searchAllCategories = async (term) => {
  const errors = []

  if(!term) {
    return { failed: true, message: "No search term provided" }
  }

  const result = await db.category.findAll({ where: Sequelize.or(
    { name: { [Op.iLike]: `%${  term  }%` } }
  )})
  .catch(err => {
    errors.push(err)
    return errors
  })
  return(result)
}

module.exports.checkAndCreateCategory = async (category) => {
  let categoryid
  const errors = []

  if(!category) {
    return { failed: true, message: "No category name provided" }
  }

  const categoryObj = await db.category.findOne({
    where: {
      name: category
    }
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (categoryObj) {
    categoryid = categoryObj.dataValues.id
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

module.exports = {
  getAllCategories
}