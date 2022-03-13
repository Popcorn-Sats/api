const Sequelize = require('sequelize')
const { Model } = require('sequelize')

module.exports = (sequelize) => {
  class TransactionLedger extends Model {

    static getTransactionLedgersByAccountID(accountId) {
      return this.findAll({
        where: {
          accountId
        }
      })
    }

    static getAmountsFromTransactionListByAccountID(transactionIds, accountId) {
      return this.findAll({
        where: {
          transactionId: {
            [Sequelize.Op.in]: transactionIds
          },
          accountId
        },
        attributes: ['amount', 'transactiontypeId']
      })
    }

    static getAmountsFromTransactionListForOwnedAccounts(transactionIds) {
      return this.findAll({
        include: [
          {
            model: sequelize.models.account,
            where: {
              owned: true,
            },
            required: true,
          },
        ],
        where: {
          transactionId: {
            [Sequelize.Op.in]: transactionIds
          },
          accountId: {
            [Sequelize.Op.gt]: 0
          }
        },
        attributes: ['amount', 'transactiontypeId'],
      })
    }

    static associate(models) {
      TransactionLedger.belongsTo(models.transaction, {
        foreignKey: 'transactionId'
      })
      TransactionLedger.belongsTo(models.transactiontype, {
        foreignKey: 'transactiontypeId'
      })
      TransactionLedger.belongsTo(models.account, {
        foreignKey: 'accountId'
      })
      TransactionLedger.belongsTo(models.address, {
        foreignKey: 'addressId'
      })
      TransactionLedger.belongsTo(models.utxo, {
        foreignKey: 'utxoId'
      })
    }
  }

  TransactionLedger.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: Sequelize.BIGINT
    },
    currency: {
      type: Sequelize.STRING
    },
    fiatAmount: {
      type: Sequelize.BIGINT
    },
    fiatCurrency: {
      type: Sequelize.STRING
    }
  }, {
    sequelize,
    modelName: 'transactionledger',
  })
  return TransactionLedger
}

// Each transaction ledger should have one UTXO (created or consumed). Each UTXO belongs to many (1 or 2) transaction ledgers.
// Each UTXO *belongs to* an address. Each address hasMany UTXOs (even though this is bad practice)
// Each address *belongs to* an Account.
// Each address optionally belongs to an xPub that belongs to an account. The xPubs are behind the scenes for certain automations.
