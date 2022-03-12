/* eslint-disable no-console */
const _ = require('lodash')
const db = require('../../models')
const { listTransactionsByAccountId } = require('./listTransactionsByAccountId')

const getInitialBalance = async ({ categoryid, offset, limit}) => {
  const errors = []
  let transactions
  if(categoryid) {
    transactions = await db.transaction.findAll({
      where: {
        categoryid
      },
      attributes: ['id'],
      order: [
        ['id', 'DESC'],
      ],
      offset,
      limit,
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
  } else {
    transactions = await db.transaction.findAll({
      attributes: ['id'],
      order: [
        ['id', 'DESC'],
      ],
      offset,
      limit,
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
  }

  const transactionIds = transactions.map(transaction => transaction.id)
  const ledgers = await db.transactionledger.findAll({
    attributes: ['amount', 'transactiontypeId'],
    order: [
      ['id', 'DESC'],
    ],
    include: [
      {
        model: db.account,
        where: {
          owned: true,
        },
        required: true,
      },
    ],
    where: {
      transactionId: transactionIds,
    }
  })

  const credits = []
  const debits = []
  ledgers.forEach(ledger => {
    if (!ledger.transactiontypeId) {
      console.log({failed: true, message: `Ledger ID ${ledger.id} does not have a transaction type`})
      return({failed: true, message: `Ledger ID ${ledger.id} does not have a transaction type`})
    }
    if (ledger.transactiontypeId === 2) {
      credits.push(parseInt(ledger.amount, 10))
    }
    else if (ledger.transactiontypeId === 1) {
      debits.push(parseInt(ledger.amount, 10))
    }
  });
  const balance = _.sum(credits) - _.sum(debits)
  return balance
}

const getInitialAccountBalance = async ({ accountId, offset, limit}) => { // FIXME: Broken for Coinjoin wallets
  const transactionList = await listTransactionsByAccountId(accountId)
  const orderedTransactions = _.sortBy(transactionList)
  const transactionIds = orderedTransactions.slice(offset, offset + limit)

  const ledgers = await db.transactionledger.findAll({
    attributes: ['amount', 'transactiontypeId'],
    order: [
      ['id', 'DESC'],
    ],
    include: [
      {
        model: db.account,
        where: {
          id: accountId,
        },
        required: true,
      },
    ],
    where: {
      transactionId: transactionIds,
    }
  })

  const credits = []
  const debits = []
  ledgers.forEach(ledger => { // FIXME: DRY
    if (!ledger.transactiontypeId) {
      console.log({failed: true, message: `Ledger ID ${ledger.id} does not have a transaction type`})
      return({failed: true, message: `Ledger ID ${ledger.id} does not have a transaction type`})
    }
    if (ledger.transactiontypeId === 2) {
      credits.push(parseInt(ledger.amount, 10))
    }
    else if (ledger.transactiontypeId === 1) {
      debits.push(parseInt(ledger.amount, 10))
    }
  });
  const balance = _.sum(credits) - _.sum(debits)
  return balance
}

module.exports = {
  getInitialBalance,
  getInitialAccountBalance,
}