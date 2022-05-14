/* eslint-disable no-console */
const express = require('express')

const { authJwt } = require('../middleware')
const ctrl = require('../controllers/reports')

const router = express.Router()

router
  /* .use(
    authJwt.verifyToken,
  ) */
  .get(
    '/',
    ctrl.getReports
  )
  .get(
    '/balancesheet',
    ctrl.getSingleBalanceSheet
  )

module.exports = router
