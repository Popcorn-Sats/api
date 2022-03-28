const db = require("../models")

const User = db.user
const ROLES = ["user", "admin", "moderator"]

const checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    where: {
      username: req.body.username
    }
  }).then(username => {
    if (username) {
      res.status(400).send({
        message: "Username is already in use."
      })
      return
    }
    // Email
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(useremail => {
      if (useremail) {
        res.status(400).send({
          message: "Email is already in use."
        })
        return
      }
      next()
    })
  })
}

const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i += 1) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Role does not exist =  ${req.body.roles[i]}`
        })
        return
      }
    }
  }
  
  next()
}

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
}

module.exports = verifySignUp
