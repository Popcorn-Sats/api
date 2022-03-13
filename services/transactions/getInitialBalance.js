/* eslint-disable no-console */
const _ = require('lodash')
const db = require('../../models')
const { listTransactionsByAccountId } = require('./listTransactionsByAccountId')

const getBalanceFromLedgers = async (ledgers) => {
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

const getInitialBalance = async ({ categoryid, offset, limit}) => {
  let transactions
  if(categoryid) {
    transactions = await db.transaction.getOffsetCategoryTransactions(categoryid, offset, limit)
  } else {
    transactions = await db.transaction.getOffsetTransactions(offset, limit)
  }

  const transactionIds = transactions.map(transaction => transaction.id)
  const ledgers = await db.transactionledger.getAmountsFromTransactionListForOwnedAccounts(transactionIds)
  const balance = await getBalanceFromLedgers(ledgers)
  return balance
}

const getInitialAccountBalance = async ({ accountId, offset, limit}) => { // FIXME: Broken for Coinjoin wallets
  const transactionList = await listTransactionsByAccountId(accountId)
  const orderedTransactions = _.sortBy(transactionList)
  const transactionIds = orderedTransactions.slice(offset, offset + limit)
  const ledgers = await db.transactionledger.getAmountsFromTransactionListByAccountID(transactionIds, accountId)
  const balance = await getBalanceFromLedgers(ledgers)
  return balance
}

module.exports = {
  getInitialBalance,
  getInitialAccountBalance,
}