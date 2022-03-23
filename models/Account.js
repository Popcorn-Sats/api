const Sequelize = require('sequelize')
const { Model } = require('sequelize')
const { paginate } = require('../utils/paginate')

const { Op } = Sequelize

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

    static findAllAccountsPaginated(page, perPage, sort = 'id', order = 'ASC', filter) {
      let keys; let values
      let where = {}
      if (filter && Object.keys(filter).length > 0 && filter.constructor === Object) {
        keys = Object.keys(filter) // TODO: Fine for this one, but need to loop through all keys
        values = Object.values(filter)
        const filterName = filter ? keys[0] : null
        const filterValue = filter ? values[0] : null
        where = {
          [Op.or]: [
            {
              [filterName]: {
                [Op.iLike]: `%${filterValue}%`
              }
            }
          ]
        }
      } // TODO: DRY this up (used in Category model)
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