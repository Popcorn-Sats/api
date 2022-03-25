/* eslint-disable no-console */
const express = require('express')

const ctrl = require('../controllers/reports')

const router = express.Router()

router
  .get('/', ctrl.getReports)

module.exports = router;