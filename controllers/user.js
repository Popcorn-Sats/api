const Sequelize = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../models')
const config = require('../config/auth.config')

const { Op } = Sequelize
const User = db.user
const Role = db.role
const RefreshToken = db.refreshToken

const createUser = async (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
}

const loginUser = async (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(async user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }
      const token = jwt.sign({ id: user.id }, config.security.jwt.secret, {
        expiresIn: config.security.jwt.jwtExpiration
      });
      const refreshToken = await RefreshToken.createToken(user);
      const authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i += 1) {
          authorities.push(`ROLE_ ${roles[i].name.toUpperCase()}`);
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token,
          tokenExpiry: config.security.jwt.jwtExpiration,
          refreshToken,
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
}

const refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body
  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" })
  }
  try {
    const findRefreshToken = await RefreshToken.findOne({ where: { token: requestToken } })
    if (!findRefreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" })
      return
    }
    if (RefreshToken.verifyExpiration(findRefreshToken)) {
      RefreshToken.destroy({ where: { id: findRefreshToken.id } })
      
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      })
      return
    }
    const user = await findRefreshToken.getUser()
    const newAccessToken = jwt.sign({ id: user.id }, config.security.jwt.secret, {
      expiresIn: config.security.jwt.jwtExpiration,
    })
    return res.status(200).json({
      accessToken: newAccessToken,
      tokenExpiry: config.security.jwt.jwtExpiration,
      refreshToken: findRefreshToken.token,
    })
  } catch (err) {
    return res.status(500).send({ message: err })
  }
}

const allAccess = (req, res) => {
  res.status(200).send({
    message: "You have access to all routes"
  });
};

const userBoard = (req, res) => {
  res.status(200).send({
    message: "You have access to user routes"
  });
};

const adminBoard = (req, res) => {
  res.status(200).send({
    message: "You have access to admin routes"
  });
};

const moderatorBoard = (req, res) => {
  res.status(200).send({
    message: "You have access to moderator routes"
  });
};

module.exports = {
  createUser,
  loginUser,
  refreshToken,
  allAccess,
  userBoard,
  adminBoard,
  moderatorBoard
}