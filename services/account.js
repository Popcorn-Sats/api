/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')

const {Op} = Sequelize

module.exports.getAllAccounts = async () => {
  const errors = []
  const accounts = await db.account.findAll({
    order: [
        ['id', 'ASC'],
    ],
    include: [db.xpub, db.accounttype]
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!accounts) {
    return { failed: true, message: "No accounts were found" }
  }
  return accounts
}

module.exports.getAccountById = async (id) => {
  const errors = []
  const account = await db.account.findOne({
    where: {
      id
    },
    include: [db.xpub, db.accounttype]
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!account) {
    return { failed: true, message: "No accounts were found" }
  }
  return account
}

module.exports.editAccountById = async (account) => {
  const { id, name, notes, birthday } = account
  const accounttype = parseInt(account.accounttype, 10)
  const errors = []
  const editedAccount = await db.account.update(
    { 
        name, 
        notes, 
        birthday, 
        accounttype
    }, {
        where: {
            id
        }
    }
  )
  .catch(err => {
    errors.push(err)
    return errors
  })
  return editedAccount
}

module.exports.createAccount = async (account) => {
  const { name, notes, birthday } = account
  const accounttype = parseInt(account.accountType, 10)
  const errors = []

  // Validate required fields
  if(!name || !birthday || !accounttype) {
    return { failed: true, message: "Missing required field(s)" }
  }

  // Check for  errors
  if (errors.length > 0) {
    return ('add', {
      name, 
      birthday, 
      accounttype
    })
  }

  const newAccount = await db.account.create({
    name, 
    notes, 
    birthday, 
    accounttype
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  return newAccount
}

module.exports.searchAllAccounts = async (term) => {
  const errors = []
  const result = await db.account.findAll({ where: {[Op.or]: [
      { '$xpub.name$': { [Op.iLike]: `%${  term  }%` } },
      { name: { [Op.iLike]: `%${  term  }%` } },
      { notes: { [Op.iLike]: `%${  term  }%` } }
  ]},
include: [
  { model: db.xpub },
]})
  .catch(err => {
    errors.push(err)
    return errors
  })
  return(result)
}

module.exports.checkAndCreateAccount = async (name) => {
  let accountId
  const errors = []
  const accounts = await db.account.findAll({
    where: {
      name
    }
  })
  if (accounts[0]) {
    accountId = accounts[0].dataValues.id
  } else {
    const newAccount = await db.account.create({
      name
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
    accountId = newAccount.dataValues.id
  }
  return accountId
}