const express = require('express')

const { verifySignUp, authJwt } = require('../middleware')
const ctrl = require('../controllers/user')

const router = express.Router()

router
  .post(
    '/signup',
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    ctrl.createUser)
  .post('/login', ctrl.loginUser)
  .post('/refreshtoken', ctrl.refreshToken)

  .get("/test/all", ctrl.allAccess)
  .get(
    "/test/user",
    [authJwt.verifyToken],
    ctrl.userBoard
  )
  .get(
    "/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    ctrl.moderatorBoard
  )
  .get(
    "/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    ctrl.adminBoard
  )

module.exports = router;