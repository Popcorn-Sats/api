const {
  Model
} = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Utxo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Utxo.hasMany(models.transactionledger)
      Utxo.belongsTo(models.address)
    }
  };
  Utxo.init({
    utxo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'utxo',
  });
  return Utxo;
}
