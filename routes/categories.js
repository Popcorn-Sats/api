/* eslint-disable no-console */
const express = require('express')

const { authJwt } = require('../middleware')
const ctrl = require('../controllers/category')

const router = express.Router()

router
  .use(
    authJwt.verifyToken,
  )
  .get(
    '/',
    ctrl.getCategories
  )
  .put(
    '/:id',
    ctrl.editCategory
  )
  .delete(
    '/:id',
    ctrl.deleteCategory
  )
  .post(
    '/',
    ctrl.addCategory
  )
  .get(
    '/search',
    ctrl.searchCategories
  )
  .get(
    '/:categoryId',
    ctrl.getSingleCategory
  )

module.exports = router;