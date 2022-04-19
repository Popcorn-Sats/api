/* eslint-disable no-console */
const express = require('express')

const { authJwt } = require('../middleware')
const ctrl = require('../controllers/reports')

const router = express.Router()

router
  .get(
    '/',
    [authJwt.verifyToken],
    ctrl.getReports
  )

module.exports = router;