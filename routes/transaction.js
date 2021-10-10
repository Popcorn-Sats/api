const express = require('express')

const ctrl = require('../controllers/transaction')

const router = express.Router()

router
  .get('/', ctrl.getTransactions)
  .get('/search', ctrl.searchTransactions)
  .get('/:accountId', ctrl.getTransactionsForAccount)
  .put('/', ctrl.editTransaction)
  .post('/add', ctrl.addTransaction)

module.exports = router;