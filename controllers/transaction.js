/* eslint-disable no-console */
const { getTransactionsByAccountID, getTransactionByID, getAllTransactions, editFullTransaction, createTransaction, searchAllTransactions } = require('../services/transaction')

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

const getTransactionByTransactionID = async (req, res) => {
  const {transactionId} = req.params
  const transaction = await getTransactionByID(transactionId)
  .catch(err => res.status(500).send(err))
  const status = transaction.failed ? 400 : 200
  return res.status(status).json(transaction)
}

const editTransaction = async (req, res) => {
  const transaction = req.body
  const editedTransaction = await editFullTransaction(transaction)
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
  getTransactionByTransactionID,
  editTransaction,
  addTransaction,
  searchTransactions
}