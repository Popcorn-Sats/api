const Sequelize = require('sequelize')
const { Model } = require('sequelize')
const _ = require('lodash')
const { getFilter } = require('../utils/getFilter')
const { paginate } = require('../utils/paginate')

const { reportAccountTypes } = require('../constants/account')

const ACCOUNT_TYPES = _.values(reportAccountTypes)

module.exports = (sequelize) => {
  class Account extends Model {

    static findAllAccounts() {
      return this.findAll({
        order: [
            ['id', 'ASC'],
        ],
        include: ['xpub', 'accounttype'],
        raw : true,
        nest : true
      })
    }

    static findAllAccountsByUserId(userId) {
      return this.findAll({
        where: {
          userId,
        },
        order: [
            ['id', 'ASC'],
        ],
        include: ['xpub', 'accounttype'],
        raw : true,
        nest : true
      })
    }

    static findAllAccountsPaginated(page, perPage, sort = 'id', order = 'ASC', filter) {
      const where = getFilter(filter)
      return this.findAndCountAll({
        where,
        order: [
            [sort, order],
        ],
        include: ['xpub', 'accounttype'],
        raw : true,
        nest : true,
        ...paginate({ page, perPage })
      })
    }

    static findAccountByName(name){
      return this.findOne({
        where: {
          name
        }
      })
    }

    static findAccountById(id){
      return this.findOne({
        where: {
          id
        }
      })
    }
    
    static associate(models) {
      Account.hasOne(models.xpub, {
        onDelete: "cascade"
      }) // Should account just have an optional unique XPub field?
      Account.belongsTo(models.accounttype, {
      })
      Account.hasMany(models.transactionledger)
      Account.hasMany(models.address)
    }
  }

  Account.init({
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    notes: {
        type: Sequelize.STRING
    },
    birthday: {
        type: Sequelize.DATE
    },
    userId: {
        type: Sequelize.INTEGER
    },
    reportAccountType: {
        type: Sequelize.ENUM(...ACCOUNT_TYPES)
    },
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    owned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'account',
  })

  return Account

}