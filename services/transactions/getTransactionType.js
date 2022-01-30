/* eslint-disable no-await-in-loop */
const _ = require('lodash')
const db = require('../../models')

const getTransactionType = async (ledgers) => {
  const creditsOwned = []
  const debitsOwned = []
  for (let i = 0; i < ledgers.length; i += 1) {
    const account = await db.account.findOne({
      where: {
        id: ledgers[i].accountId
      }
    })
    if (!account && ledgers[i].transactiontypeId === 1) {
      debitsOwned.push(false)
    }
    else if (account && ledgers[i].transactiontypeId === 1 && account?.id !== 0) {
      debitsOwned.push(account?.owned)
    } else if (!account && ledgers[i].transactiontypeId === 2) {
      creditsOwned.push(false)
    } else if (account && ledgers[i].transactiontypeId === 2 && account?.id !== 0) {
      creditsOwned.push(account?.owned)
    }
  }
  if (!_.includes(creditsOwned, false) && !_.includes(debitsOwned, false)) {
    return "transfer"
  }
  if (_.includes(creditsOwned, true) && !_.includes(debitsOwned, true)) {
    return "deposit"
  }
  if (_.includes(creditsOwned, true) && _.includes(creditsOwned, false) && _.includes(debitsOwned, true) && _.includes(debitsOwned, false)) {
    return "coinjoin"
  }
  if (_.includes(creditsOwned, false) && !_.includes(debitsOwned, false)) {
    return "withdrawal"
  }
  return null
}

module.exports = {
  getTransactionType
}