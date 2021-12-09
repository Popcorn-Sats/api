/* eslint-disable no-console */
const express = require('express')

const ctrl = require('../controllers/category')

const router = express.Router()

router
  .get('/', ctrl.getCategories)
  .put('/', ctrl.editCategory)
  .post('/add', ctrl.addCategory)
  .get('/search', ctrl.searchCategories)
  .get('/:categoryId', ctrl.getSingleCategory)

module.exports = router;