const express = require('express')
const transaction = require('./transaction')
const accounts = require('./accounts')
const categories = require('./categories')

const router = express.Router()

const getRoutes = () => {

  router.use('/transactions', transaction)
  router.use('/accounts', accounts)
  router.use('/categories', categories)

  return router
}

module.exports = getRoutes
