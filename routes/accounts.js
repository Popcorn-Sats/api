const express = require('express');

const ctrl = require('../controllers/account')
const { authJwt } = require('../middleware')

const router = express.Router();

router
  .use(
    authJwt.verifyToken,
  )
  .get(
    '/',
    ctrl.getAccounts
  )
  .put(
    '/:id',
     ctrl.editAccount
    )
  .delete(
    '/:id',
    ctrl.deleteAccount
  )
  .post(
    '/',
    ctrl.addAccount
  )
  .get(
    '/position',
    ctrl.getPosition
  )
  .get(
    '/search',
    ctrl.searchAccounts
  )
  .get(
    '/scan/:accountId',
    ctrl.scanOldAccount
  )
  .get(
    '/:accountId',
    ctrl.getSingleAccount
  )

module.exports = router
