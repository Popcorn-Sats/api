/* eslint-disable no-console */
const { getAllCategories, editCategoryById, createCategory, searchAllCategories } = require('../services/category')

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

const searchCategories = async (req, res) => {
  const { term } = req.query
  const result = await searchAllCategories(term)
  // res.render('categories', { result })
  res.json(result).send()
}

module.exports = {
  getCategories,
  editCategory,
  addCategory,
  searchCategories
}