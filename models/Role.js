const Sequelize = require('sequelize')
const { Model } = require('sequelize')

const _ = require('lodash')
const { userTypes } = require('../constants/user')

const ROLES = _.values(userTypes)

module.exports = (sequelize) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.belongsToMany(models.user, {
        through: 'user_roles',
        foreignKey: 'roleId',
        otherKey: 'userId',
      });
    }
  };
  Role.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.ENUM(...ROLES),
    },
  }, {
    sequelize,
    modelName: 'role',
  });
  return Role;
};
