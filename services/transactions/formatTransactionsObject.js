/* eslint-disable no-await-in-loop */
const _ = require('lodash')
const { getTransactionType } = require('./getTransactionType')
const db = require('../../models')

const formatTransactionsObject = async (rawTransactions, accountId) => {
  if (!rawTransactions) {
    return { failed: true, message: "No transactions were passed to format" }
  }
  const transactions = []
  const {length} = rawTransactions
  const orderedTransactions = _.orderBy(rawTransactions, 'block.height', 'asc')
  let runningBalance = 0
  for (let i = 0; i < length; i += 1) {
    const transaction = {}
    const ledgers = []
    orderedTransactions[i].transactionledgers.forEach(ledger => {
      const thisLedger = {}
      thisLedger.accountId = ledger.accountId
      thisLedger.amount = ledger.amount
      thisLedger.transactiontypeId = ledger.transactiontypeId
      ledgers.push(thisLedger)
    })
    if (accountId) {
      const accountInteger = parseInt(accountId, 10)
      const debits = _.sum(_.map(_.map(_.filter(_.filter(ledgers, {accountId: accountInteger}), {transactiontypeId: 1}), 'amount'), _.parseInt))
      const credits = _.sum(_.map(_.map(_.filter(_.filter(ledgers, {accountId: accountInteger}), {transactiontypeId: 2}), 'amount'), _.parseInt))
      transaction.balance_change = credits - debits
    } else  {
      const accounts = await db.account.findAll({
        where: {
          owned: true
        }
      })
      const ownedAccounts = _.map(accounts, 'id')
      const debits = _.sum(_.map(_.map(_.filter(_.filter(ledgers, (v) => _.includes(ownedAccounts, v.accountId)), {transactiontypeId: 1}), 'amount'), _.parseInt))
      const credits = _.sum(_.map(_.map(_.filter(_.filter(ledgers, (v) => _.includes(ownedAccounts, v.accountId)), {transactiontypeId: 2}), 'amount'), _.parseInt))
      transaction.balance_change = credits - debits
    }
    
    transaction.id = orderedTransactions[i].id
    transaction.txid = orderedTransactions[i].txid
    transaction.network_fee = orderedTransactions[i].network_fee
    transaction.size = orderedTransactions[i].size
    transaction.description = orderedTransactions[i].description
    transaction.block = orderedTransactions[i].block
    transaction.category = orderedTransactions[i].category
    transaction.transactiontype = await getTransactionType(ledgers)
    transaction.transactionledgers = orderedTransactions[i].transactionledgers
    transaction.runningBalance = runningBalance + transaction.balance_change
    runningBalance = transaction.runningBalance
    transactions.push(transaction)
  }
  return transactions.reverse()
}

module.exports = {
  formatTransactionsObject
}