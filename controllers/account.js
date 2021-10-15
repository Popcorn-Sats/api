/* eslint-disable no-console */
const { getAllAccounts, editAccountById, createAccount, searchAllAccounts } = require('../services/account')

// TODO: Error handling

const getAccounts = async (req, res) => {
  const accounts = await getAllAccounts()
  res.json(accounts).send()
  // .catch(err => res(err))
}

const editAccount = async (req, res) => {
  const account = req.body
  const editedAccount = await editAccountById(account)
  res.json(editedAccount).send()
  // .catch(err => res(err))
}

const addAccount = async (req, res) => {
  const account = req.body
  const newAccount = await createAccount(account)
  // const newAccount = await checkAndCreateAccount(account)
  res.json(newAccount).send()
}

const searchAccounts = async (req, res) => {
  const { term } = req.query
  const result = await searchAllAccounts(term)
  // res.render('accounts', { result })
  res.json(result).send()
}

module.exports = {
  getAccounts,
  editAccount,
  addAccount,
  searchAccounts
}