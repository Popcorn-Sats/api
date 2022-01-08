/* eslint-disable no-console */
const { getTransactionsByAccountID, getTransactionsByCategoryID, getTransactionByID, getAllTransactions, syncLedgerAccountId, editFullTransaction, createTransaction, changeTransactionCategory, searchAllTransactions } = require('../services/transaction')

const getTransactions = async (req, res) => {
  const transactions = await getAllTransactions()
  .catch(err => res.status(500).send(err))
  const status = transactions.failed ? 400 : 200
  return res.status(status).json(transactions)
}

const getTransactionsForAccount = async (req, res) => {
  const {accountId} = req.params
  const transactions = await getTransactionsByAccountID(accountId)
  .catch(err => res.status(500).send(err))
  const status = transactions.failed ? 400 : 200
  return res.status(status).json(transactions)
}

const getTransactionsForCategory = async (req, res) => {
  const {categoryId} = req.params
  const transactions = await getTransactionsByCategoryID(categoryId)
  .catch(err => res.status(500).send(err))
  const status = transactions.failed ? 400 : 200
  return res.status(status).json(transactions)
}

const getTransactionByTransactionID = async (req, res) => {
  const {transactionId} = req.params
  const transaction = await getTransactionByID(transactionId)
  .catch(err => res.status(500).send(err))
  const status = transaction.failed ? 400 : 200
  return res.status(status).json(transaction)
}

const addAccountToLedgers = async (req, res) => {
  const {accountId} = req.params
  const ledgers = await syncLedgerAccountId(accountId)
  .catch(err => res.status(500).send(err))
  const status = ledgers.failed ? 400 : 200
  return res.status(status).json(ledgers)
}

const editTransaction = async (req, res) => {
  const transaction = req.body
  const { id } = transaction
  const editedTransaction = await editFullTransaction(transaction, id)
  .catch(err => res.status(500).send(err))
  const status = editedTransaction.failed ? 400 : 200
  return res.status(status).json(editedTransaction)
}

const editTransactionCategory = async (req, res) => {
  const { id, categoryid} = req.body
  console.log({id, categoryid})
  const editedTransaction = await changeTransactionCategory(id, categoryid)
  .catch(err => res.status(500).send(err))
  const status = editedTransaction.failed ? 400 : 200
  return res.status(status).json(editedTransaction)
}

const addTransaction = async (req, res) => {
  const transaction = req.body
  const newTransaction = await createTransaction(transaction)
  .catch(err => res.status(500).send(err))
  const status = newTransaction.failed ? 400 : 200
  return res.status(status).json(newTransaction)
}

const searchTransactions = async (req, res) => {
  const { term } = req.query
  const result = await searchAllTransactions(term)
  .catch(err => res.status(500).send(err))
  const status = result.failed ? 400 : 200
  return res.status(status).json(result)
}

module.exports = {
  getTransactions,
  getTransactionsForAccount,
  getTransactionsForCategory,
  getTransactionByTransactionID,
  addAccountToLedgers,
  editTransaction,
  addTransaction,
  editTransactionCategory,
  searchTransactions
}