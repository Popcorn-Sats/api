const {
  Model
} = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Address.belongsTo(models.account)
      Address.hasMany(models.utxo)
    }
  }
  Address.init({
    address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'address',
  })
  return Address;
}
