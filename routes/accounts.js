const express = require('express');

const ctrl = require('../controllers/account')

const router = express.Router();

router
  .get('/', ctrl.getAccounts)
  .put('/', ctrl.editAccount)
  .post('/add', ctrl.addAccount)
  .get('/position', ctrl.getPosition)
  .get('/search', ctrl.searchAccounts)
  .get('/scan/:accountId', ctrl.scanOldAccount)
  .get('/:accountId', ctrl.getSingleAccount)

module.exports = router
