/* eslint-disable no-console */
const { getTransactionsByAccountID, getAllTransactions, editFullTransaction, createTransaction, searchAllTransactions } = require('../services/transaction')

const getTransactions = async (req, res) => {
  const transactions = await getAllTransactions()
  const status = transactions.failed ? 400 : 200
  res.status(status).json(transactions).send()
}

const getTransactionsForAccount = async (req, res) => {
  const {accountId} = req.params
  const transactions = await getTransactionsByAccountID(accountId)
  const status = transactions.failed ? 400 : 200
  res.status(status).json(transactions).send()
}

const editTransaction = async (req, res) => {
  const transaction = req.body
  const editedTransaction = await editFullTransaction(transaction)
  const status = editedTransaction.failed ? 400 : 200
  res.status(status).json(editedTransaction).send()
}

const addTransaction = async (req, res) => {
  const transaction = req.body
  const newTransaction = await createTransaction(transaction)
  const status = newTransaction.failed ? 400 : 200
  res.status(status).json(newTransaction).send()
}

const searchTransactions = async (req, res) => {
  const { term } = req.query
  const result = await searchAllTransactions(term)
  const status = result.failed ? 400 : 200
  res.status(status).json(result).send()
}

module.exports = {
  getTransactions,
  getTransactionsForAccount,
  editTransaction,
  addTransaction,
  searchTransactions
}