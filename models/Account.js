const Sequelize = require('sequelize')
const { Model } = require('sequelize')

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
      unique: true
    },
    notes: {
        type: Sequelize.STRING
    },
    birthday: {
        type: Sequelize.DATE
    },
    active: {
        type: Sequelize.BOOLEAN
    },
    owned: {
        type: Sequelize.BOOLEAN
    },
  }, {
    sequelize,
    modelName: 'account',
  })

  return Account

}