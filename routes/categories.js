/* eslint-disable no-console */
const express = require('express')

const { authJwt } = require('../middleware')
const ctrl = require('../controllers/category')

const router = express.Router()

router
  .get(
    '/',
    [authJwt.verifyToken],
    ctrl.getCategories
  )
  .put(
    '/:id',
    [authJwt.verifyToken],
    ctrl.editCategory
  )
  .delete(
    '/:id',
    [authJwt.verifyToken],
    ctrl.deleteCategory
  )
  .post(
    '/',
    [authJwt.verifyToken],
    ctrl.addCategory
  )
  .get(
    '/search',
    [authJwt.verifyToken],
    ctrl.searchCategories
  )
  .get(
    '/:categoryId',
    [authJwt.verifyToken],
    ctrl.getSingleCategory
  )

module.exports = router;