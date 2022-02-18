module.exports = (sequelize, DataTypes) => {
    const TransactionLedger = sequelize.define('transactionledger', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        amount: {
          type: DataTypes.BIGINT
        },
        currency: {
          type: DataTypes.STRING
        },
        fiatAmount: {
          type: DataTypes.BIGINT
        },
        fiatCurrency: {
          type: DataTypes.STRING
        }
    })

    TransactionLedger.associate = (models) => {
        TransactionLedger.belongsTo(models.transaction)
        TransactionLedger.belongsTo(models.transactiontype)
        TransactionLedger.belongsTo(models.account)
        TransactionLedger.belongsTo(models.address)
        TransactionLedger.belongsTo(models.utxo)
    }

    return TransactionLedger
}

// Each transaction ledger should have one UTXO (created or consumed). Each UTXO belongs to many (1 or 2) transaction ledgers.
// Each UTXO *belongs to* an address. Each address hasMany UTXOs (even though this is bad practice)
// Each address *belongs to* an Account.
// Each address optionally belongs to an xPub that belongs to an account. The xPubs are behind the scenes for certain automations.
