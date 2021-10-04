/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const { getTransactionsByAccountID, getAllTransactions, editFullTransaction, createTransaction } = require('../services/transaction')

const {Op} = Sequelize

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

// Search transactions
const searchTransactions = async (req, res) => {

  const { term } = req.query;
  // How to make this case-agnostic without making everything lowercase?
  db.transaction.findAll({ where: Sequelize.or(
      { category: { [Op.like]: `%${  term  }%` } },
      { description: { [Op.like]: `%${  term  }%` } },
      { payee: { [Op.like]: `%${  term  }%` } },
      { block_height: { [Op.like]: `%${  term  }%` } },
      { txid: { [Op.like]: `%${  term  }%` } },
      { account: { [Op.like]: `%${  term  }%` } },
      { address: { [Op.like]: `%${  term  }%` } }
  )})
  .then(transactions => res.render('transactions', { transactions }))
  .catch(err => console.log(err));
}

module.exports = {
  getTransactions,
  getTransactionsForAccount,
  editTransaction,
  addTransaction,
  searchTransactions
}