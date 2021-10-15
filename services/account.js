/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const { getObjects } = require('../utils/getObjects')

const {Op} = Sequelize

module.exports.getAllAccounts = async () => {
  const accounts = await db.account.findAll({
    order: [
        ['id', 'ASC'],
    ],
    include: [db.xpub, db.accounttype]
  })
  if (!accounts) {
    return { failed: true, message: "No accounts were found" }
  }
  return accounts
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
    // res(errors)
    // console.log(err)
  })
  return editedAccount
}

module.exports.createAccount = async (account) => {
  const { name, notes, birthday } = account
  const accounttype = parseInt(account.accountType, 10)
  const errors = []

  const newAccount = await db.account.create({
    name, 
    notes, 
    birthday, 
    accounttype
  })
  .catch(err => {
    errors.push(err)
  })
  return newAccount

  /* // Validate fields
  if(!name || !birthday || !accounttype) {
      res.status(400).send()
  }

  // Check for  errors
  if(errors.length > 0) {
      res.send('add', {
          errors,
          name, 
          notes, 
          birthday, 
          accounttype
      })
  } else {
      // Insert into table
      db.account.create({
          name, 
          notes, 
          birthday, 
          accounttype
      })
      .then(account => res.json(account))
      .catch(err => {
        errors.push(err)
      });
  } */
}

module.exports.searchAllAccounts = async (term) => {
  const errors = []
  const result = await db.account.findAll({ where: Sequelize.or(
      { xpub: { [Op.iLike]: `%${  term  }%` } },
      { name: { [Op.iLike]: `%${  term  }%` } },
      { notes: { [Op.iLike]: `%${  term  }%` } },
      { accounttype: { [Op.iLike]: `%${  term  }%` } }
  )})
  .catch(err => {
    errors.push(err)
  })
  return(result)
}

module.exports.checkAndCreateAccount = async (name) => {
  let accountMatch
  let accountId
  await db.account.findAll({
    order: [
        ['id', 'ASC'],
    ],
  })
  .then(accounts => {
      accountMatch = getObjects(accounts, '', name)
      if (accountMatch[0]) {
          accountId = accountMatch[0].id
      }
      else {
          // Insert into table
          db.account.create({
              name
          })
          .then(
              account => {
                  // console.log(account)
                  accountId = account.id
              }
          )
          .catch(err => console.log(err));
      }
  })
  .catch(err => console.log(err));
  return accountId
}