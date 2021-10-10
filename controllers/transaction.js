/* eslint-disable no-console */
const { getTransactionsByAccountID, getAllTransactions, editFullTransaction, createTransaction, searchAllTransactions } = require('../services/transaction')

// TODO: Error handling

const getTransactions = async (req, res) => {
  const transactions = await getAllTransactions()
  res.json(transactions)
  // .catch(err => res(err))
}

const getTransactionsForAccount = async (req, res) => {
  const {accountId} = req.params
  const transactions = await getTransactionsByAccountID(accountId)
  // const status = transactions.failed ? 400 : 200
  res.json(transactions)
}

const editTransaction = async (req, res) => {
  const transaction = req.body
  const editedTransaction = await editFullTransaction(transaction)
  res.json(editedTransaction).send()
}

const addTransaction = async (req, res) => {
  const transaction = req.body
  const newTransaction = await createTransaction(transaction)
  res.json(newTransaction).send()
}

const searchTransactions = async (req, res) => {
  const { term } = req.query
  const result = await searchAllTransactions(term)
  // res.render('transactions', { result })
  res.json(result).send()
}

module.exports = {
  getTransactions,
  getTransactionsForAccount,
  editTransaction,
  addTransaction,
  searchTransactions
}