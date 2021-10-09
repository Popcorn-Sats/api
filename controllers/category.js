/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const { getAllCategories, editCategoryById, createCategory } = require('../services/category')

const {Op} = Sequelize

// TODO: Error handling

const getCategories = async (req, res) => {
  const categories = await getAllCategories()
  res.json(categories)
  // .catch(err => res(err))
}

const editCategory = async (req, res) => {
  const category = req.body
  const editedCategory = await editCategoryById(category)
  res.json(editedCategory).send()
  // .catch(err => res(err))
}

const addCategory = async (req, res) => {
  const category = req.body
  const newCategory = await createCategory(category)
  // const newCategory = await checkAndCreateCategory(category)
  res.json(newCategory).send()
}

module.exports = {
  getCategories,
  editCategory,
  addCategory
}