/* eslint-disable no-underscore-dangle */
const Sequelize = require('sequelize')
const { Model } = require('sequelize');

const { v4: uuidv4 } = require('uuid');
const config = require('../config/auth.config');

module.exports = (sequelize) => {
  class RefreshToken extends Model {

      static createToken(user) {
        const expiredAt = new Date()
        expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration)
        const _token = uuidv4()
        const refreshToken = this.create({
          token: _token,
          userId: user.id,
          expiryDate: expiredAt.getTime(),
        })
        return refreshToken.token
      }

      static verifyExpiration(token) {
        return token.expiryDate.getTime() < new Date().getTime()
      }
    
      static associate(models) {
        RefreshToken.belongsTo(models.user, {
          foreignKey: 'userId',
          targetKey: 'id',
        });

      // define association here
    }
  };
  RefreshToken.init({
    token: Sequelize.STRING,
    expiryDate: Sequelize.DATE,
    userId: Sequelize.INTEGER,
  }, {
    sequelize,
    modelName: 'refreshToken',
  });
  return RefreshToken;
};