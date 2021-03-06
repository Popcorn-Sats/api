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
  .post('/logout', ctrl.logoutUser)
  .post('/refreshtoken', ctrl.refreshToken)

  .get("/test/all", ctrl.allAccess)
  .get(
    "/test/owner",
    [authJwt.verifyToken],
    ctrl.ownerBoard
  )
  .get(
    "/test/agent",
    [authJwt.verifyToken, authJwt.isAgent],
    ctrl.agentBoard
  )
  .get(
    "/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    ctrl.adminBoard
  )

module.exports = router;
