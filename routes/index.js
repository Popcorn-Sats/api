const express = require('express')
const transactions = require('./transactions')
const accounts = require('./accounts')
const categories = require('./categories')

const router = express.Router()

const getRoutes = () => {

  router.use('/transactions', transactions)
  router.use('/accounts', accounts)
  router.use('/categories', categories)

  return router
}

module.exports = getRoutes
