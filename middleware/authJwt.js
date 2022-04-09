/* eslint-disable consistent-return */
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");

const User = db.user;

const { TokenExpiredError } = jwt
const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized. Access Token was expired." })
  }
  return res.sendStatus(401).send({ message: "Unauthorized." })
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["x-access-token"] || req.headers.authorization
  let token
  if (authHeader.startsWith("Bearer ")){
    token = authHeader.substring(7, authHeader.length);
  } else {
    return res.status(401).send({ message: "Unauthorized." })
  }
  if (!token) {
    return res.status(403).send({
      message: "No token provided."
    });
  }
  jwt.verify(token, config.security.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized."
      });
    }
    req.userId = decoded.id;
    next();
  });
};
const isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i += 1) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }
      res.status(403).send({
        message: "Require Admin Role."
      });
    });
  });
};
const isModerator = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i += 1) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }
      }
      res.status(403).send({
        message: "Require Moderator Role."
      });
    });
  });
};
const isModeratorOrAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i += 1) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }
      res.status(403).send({
        message: "Require Moderator or Admin Role."
      });
    });
  });
};
const authJwt = {
  catchError,
  verifyToken,
  isAdmin,
  isModerator,
  isModeratorOrAdmin
};

module.exports = authJwt;
