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
      Utxo.belongsTo(models.transactionledger)
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
