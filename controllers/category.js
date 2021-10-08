/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const { getAllCategories } = require('../services/category')

const {Op} = Sequelize

// TODO: Error handling

const getCategories = async (req, res) => {
  const categories = await getAllCategories()
  res.json(categories)
  // .catch(err => res(err))
}

module.exports = {
  getCategories
}