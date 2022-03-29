const Sequelize = require('sequelize')
const { Model } = require('sequelize')

module.exports = (sequelize) => {
  class User extends Model {

    static associate(models) {
      User.hasMany(models.account)
      User.belongsToMany(models.role, {
        through: 'user_roles',
        foreignKey: 'userId',
        otherKey: 'roleId',
      })
      User.hasOne(models.refreshToken, {
        foreignKey: 'userId',
        targetKey: 'id',
      })
    }
  };

  User.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    }
  }, {
    sequelize,
    modelName: 'user',
  });
  return User;
};