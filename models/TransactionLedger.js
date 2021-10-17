module.exports = (sequelize, DataTypes) => {
    const TransactionLedger = sequelize.define('transactionledger', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        address: {
            type: DataTypes.STRING
        },


    })

    TransactionLedger.associate = (models) => {
        TransactionLedger.belongsTo(models.transaction)
        TransactionLedger.belongsTo(models.transactiontype)
        TransactionLedger.belongsTo(models.account)
    }

    return TransactionLedger
}