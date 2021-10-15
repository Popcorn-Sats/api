/* eslint-disable camelcase */
/* eslint-disable no-console */
const db = require('../models')
const { getObjects } = require('../utils/getObjects')

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