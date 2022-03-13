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
          foreignKey: 'categoryid',
          onDelete: 'set null',
        });
      // Note: had to change transactions.categoryId column to all lower case due to sequelize.literal bug

      Transaction.belongsTo(models.transactiontype);

      Transaction.belongsTo(models.block, {
          foreignKey: 'blockId'
        });

      Transaction.TransactionLedgers = Transaction.hasMany(models.transactionledger)
  }

  Transaction.findByTransactionId = (txid) => Transaction.findOne({ where: { txid } })

  Transaction.getOffsetTransactions = (offset, limit) => 
    Transaction.findAll({
      attributes: ['id'],
      order: [
        ['id', 'DESC'],
      ],
      offset,
      limit,
    })

  Transaction.getOffsetCategoryTransactions = (categoryid, offset, limit) =>
    Transaction.findAll({
      where: {
        categoryid
      },
      attributes: ['id'],
      order: [
        ['id', 'DESC'],
      ],
      offset,
      limit,
    })

  return Transaction
}