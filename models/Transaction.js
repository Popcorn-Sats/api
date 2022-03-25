const Sequelize = require('sequelize')
const { Model } = require('sequelize')
const { paginate } = require('../utils/paginate')
const { getFilter } = require('../utils/getFilter')

module.exports = (sequelize) => {

  class Transaction extends Model {
      
      static getAllTransactionsPaginated(page, perPage, sort = 'id', order = 'DESC', filter) {
        const where = getFilter(filter)
        return this.findAndCountAll({
          where, // FIXME: Not working
          attributes: {
            include: [
              [
                sequelize.literal(`(SELECT height FROM blocks WHERE blocks."id" = transaction."blockId")`), 'blockHeight'
              ]
            ]
          },
          include: ['category', 'block', 'transactiontype', {model: sequelize.models.transactionledger, include: ['account', 'utxo']}],
          order: [
              [[sequelize.literal('"blockHeight"'), 'DESC']],
              [sort, order],
          ],
          distinct: true, // Needed to get correct count
          ...paginate({ page, perPage })
        })
      }

      static findByTransactionId(txid){
        return this.findOne({ where: { txid } })
      }

      static getOffsetTransactions(offset, limit){ 
        return this.findAll({
          attributes: [
            'id',
            [
              sequelize.literal(`(SELECT height FROM blocks WHERE blocks."id" = transaction."blockId")`), 'blockHeight'
            ]
          ],
          order: [
            [[sequelize.literal('"blockHeight"'), 'DESC']],
            ['id', 'DESC'],
          ],
          offset,
          limit,
        })
      }

      static getOffsetCategoryTransactions(categoryid, offset, limit){
        return this.findAll({
          where: {
            categoryid
          },
          attributes: ['id'],
          order: [
            [[sequelize.literal('"blockHeight"'), 'DESC']],
            ['id', 'DESC'],
          ],
          offset,
          limit,
        })
      }
  
      static associate(models) {
        Transaction.belongsTo(models.category, {
          foreignKey: 'categoryid',
          onDelete: 'set null',
        })
        // Note: had to change transactions.categoryId column to all lower case due to sequelize.literal bug
        Transaction.belongsTo(models.transactiontype);

        Transaction.belongsTo(models.block, {
            foreignKey: 'blockId'
          });

        Transaction.TransactionLedgers = Transaction.hasMany(models.transactionledger)
      }
  }

  Transaction.init({
    // Note: primary key needed in model for Sequelize to merge properly on 'hasMany'
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    txid: {
      type: Sequelize.STRING,
    },
    network_fee: {
      type: Sequelize.INTEGER,
    },
    size: {
      type: Sequelize.DECIMAL,
    },
    description: {
      type: Sequelize.STRING,
    }
  }, {
    sequelize,
    modelName: 'transaction',
  })

  return Transaction

}