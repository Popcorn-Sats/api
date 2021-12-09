/* eslint-disable no-console */
const { getAllCategories, getCategoryById, editCategoryById, createCategory, searchAllCategories } = require('../services/category')

// TODO: Error handling

const getCategories = async (req, res) => {
  const categories = await getAllCategories()
  .catch(err => res.status(500).send(err))
  return res.json(categories)
  // .catch(err => res(err))
}

const getSingleCategory = async (req, res) => {
  const {categoryId} = req.params
  const category = await getCategoryById(categoryId)
  .catch(err => res.status(500).send(err))
  return res.json(category)
}

const editCategory = async (req, res) => {
  const category = req.body
  const editedCategory = await editCategoryById(category)
  .catch(err => res.status(500).send(err))
  return res.json(editedCategory)
}

const addCategory = async (req, res) => {
  const category = req.body
  const newCategory = await createCategory(category)
  .catch(err => res.status(500).send(err))
  // const newCategory = await checkAndCreateCategory(category)
  return res.json(newCategory)
}

const searchCategories = async (req, res) => {
  const { term } = req.query
  const result = await searchAllCategories(term)
  .catch(err => res.status(500).send(err))
  // res.render('categories', { result })
  return res.json(result)
}

module.exports = {
  getCategories,
  getSingleCategory,
  editCategory,
  addCategory,
  searchCategories
}