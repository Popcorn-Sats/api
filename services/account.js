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
  const { name, notes, birthday, active, owned, publicKey } = account // TODO: add scripttype here and to model/migrations
  const accounttypeId = parseInt(account.accounttypeId, 10)
  const errors = []

  // Validate required fields
  if(!name || !birthday || !accounttypeId) {
    return { failed: true, message: "Missing required field(s)" }
  }

  const xpubExists = await db.xpub.findOne({
    where: {
      name: publicKey
    }
  })

  if(xpubExists) {
    return({failed: true, message: "Public key already associated with another account"})
  }

  const newAccount = await db.account.create({
    name, 
    notes, 
    birthday, 
    accounttypeId,
    active: active || true,
    owned: owned || true,
    xpub: {name: publicKey}
  }, {
    include: [
        {
            model: db.xpub
        }
    ]
  })
  .catch(err => {
    errors.push(err)
    console.log(errors)
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
  const accountObj = await db.account.findOne({
    where: {
      name
    }
  })
  if (accountObj) {
    accountId = accountObj.dataValues.id
  } else {
    const newAccount = await db.account.create({
      name,
      birthday: new Date(), 
      accounttypeId: 3,
      active: true,
      owned: false
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
    accountId = newAccount.dataValues.id
  }
  return accountId
}