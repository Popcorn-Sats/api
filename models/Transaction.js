module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('transaction', {
    // Note: primary key needed in model for Sequelize to merge properly on 'hasMany'
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    txid: {
      type: DataTypes.STRING,
    },
    balance_change: {
      type: DataTypes.INTEGER,
    },
    address: {
      type: DataTypes.STRING,
    },
    network_fee: {
      type: DataTypes.INTEGER,
    },
    size: {
      type: DataTypes.DECIMAL,
    },
    description: {
      type: DataTypes.STRING,
    }
  })

  Transaction.associate = (models) => {
      Transaction.belongsTo(models.category, {
          foreignKey: 'categoryid'
        });
      // Note: had to change transactions.categoryId column to all lower case due to sequelize.literal bug

      Transaction.belongsTo(models.transactiontype);

      Transaction.belongsTo(models.block, {
          foreignKey: 'blockId'
        });

      Transaction.TransactionLedgers = Transaction.hasMany(models.transactionledger)
  }

  Transaction.findByTransactionId = (txid) => this.findOne({ where: { txid } })

  return Transaction
}