const express = require('express');

const ctrl = require('../controllers/account')
const { authJwt } = require('../middleware')

const router = express.Router();

router
  .get(
    '/',
    [authJwt.verifyToken],
    ctrl.getAccounts)
  .put(
    '/:id',
    [authJwt.verifyToken],
     ctrl.editAccount)
  .delete(
    '/:id',
    [authJwt.verifyToken],
    ctrl.deleteAccount)
  .post(
    '/',
    [authJwt.verifyToken],
    ctrl.addAccount)
  .get(
    '/position',
    [authJwt.verifyToken],
    ctrl.getPosition)
  .get(
    '/search',
    [authJwt.verifyToken],
    ctrl.searchAccounts)
  .get('/scan/:accountId', ctrl.scanOldAccount)
  .get(
    '/:accountId',
    [authJwt.verifyToken],
    ctrl.getSingleAccount)

module.exports = router
