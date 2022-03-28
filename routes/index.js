const express = require('express')
const transaction = require('./transaction')
const accounts = require('./accounts')
const categories = require('./categories')
const reports = require('./reports')
const users = require('./users')

const router = express.Router()

const getRoutes = () => {

  router.use('/transactions', transaction)
  router.use('/accounts', accounts)
  router.use('/categories', categories)
  router.use('/reports', reports)
  router.use('/users', users)

  return router
}

module.exports = getRoutes
