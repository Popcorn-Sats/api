const express = require('express')

const { authJwt } = require('../middleware')
const ctrl = require('../controllers/transaction')

const router = express.Router()

router
  .get(
    '/',
    [authJwt.verifyToken],
    ctrl.getTransactions
  )
  .get(
    '/search',
    [authJwt.verifyToken],
    ctrl.searchTransactions
  )
  .get(
    '/account/:accountId',
    [authJwt.verifyToken],
    ctrl.getTransactionsForAccount
  )
  .get(
    '/category/:categoryId',
    [authJwt.verifyToken],
    ctrl.getTransactionsForCategory
  )
  .get(
    '/transaction/:transactionId',
    [authJwt.verifyToken],
    ctrl.getTransactionByTransactionID
  )
  .put(
    '/:id',
    [authJwt.verifyToken],
    ctrl.editTransaction
  )
  .put(
    '/category',
    [authJwt.verifyToken],
    ctrl.editTransactionCategory
  )
  .post(
    '/add',
    [authJwt.verifyToken],
    ctrl.addTransaction
  )

module.exports = router;