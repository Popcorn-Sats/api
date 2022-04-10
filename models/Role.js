const Sequelize = require('sequelize')
const { Model } = require('sequelize')

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
      type: Sequelize.STRING, // FIXME: should this be ENUM?
    },
  }, {
    sequelize,
    modelName: 'role',
  });
  return Role;
};
