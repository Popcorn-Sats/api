const express = require('express')

const { authJwt } = require('../middleware')
const ctrl = require('../controllers/transaction')

const router = express.Router()

router
  .use(
    authJwt.verifyToken,
  )
  .get(
    '/',
    ctrl.getTransactions
  )
  .get(
    '/search',
    ctrl.searchTransactions
  )
  .get(
    '/account/:accountId',
    ctrl.getTransactionsForAccount
  )
  .get(
    '/category/:categoryId',
    ctrl.getTransactionsForCategory
  )
  .get(
    '/transaction/:transactionId',
    ctrl.getTransactionByTransactionID
  )
  .put(
    '/:id',
    ctrl.editTransaction
  )
  .put(
    '/category',
    ctrl.editTransactionCategory
  )
  .post(
    '/add',
    ctrl.addTransaction
  )

module.exports = router;