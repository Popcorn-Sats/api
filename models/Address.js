const Sequelize = require('sequelize')
const { Model } = require('sequelize')

module.exports = (sequelize) => {
  class Address extends Model {

    static associate(models) {
      Address.belongsTo(models.account)
      Address.hasMany(models.utxo)
      Address.hasMany(models.transactionledger)
    }
  }
  Address.init({
    address: Sequelize.STRING,
    txIndex: Sequelize.INTEGER,
    chain: Sequelize.INTEGER
  }, {
    sequelize,
    modelName: 'address',
  })
  return Address;
}
