const express = require('express');

const ctrl = require('../controllers/account')

const router = express.Router();

router
  .get('/', ctrl.getAccounts)
  .put('/', ctrl.editAccount)
  .post('/add', ctrl.addAccount)
  .get('/search', ctrl.searchAccounts)
  .get('/:accountId', ctrl.getSingleAccount)

module.exports = router;