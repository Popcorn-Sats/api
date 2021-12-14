/* eslint-disable no-console */
const { getAllAccounts, editAccountById, createAccount, searchAllAccounts, getAccountById, scanAccount } = require('../services/account')

// TODO: Error handling

const getAccounts = async (req, res) => {
  const accounts = await getAllAccounts()
  .catch(err => res.status(500).send(err))
  return res.json(accounts)
}

const getSingleAccount = async (req, res) => {
  const {accountId} = req.params
  const account = await getAccountById(accountId)
  .catch(err => res.status(500).send(err))
  return res.json(account)
}

const editAccount = async (req, res) => {
  const account = req.body
  const editedAccount = await editAccountById(account)
  .catch(err => res.status(500).send(err))
  return res.json(editedAccount)
}

const addAccount = async (req, res) => {
  const account = req.body
  const newAccount = await createAccount(account)
  .catch(err => res.status(500).send(err))
  res.json(newAccount)
}

const scanOldAccount = async (req, res) => {
  const {accountId} = req.params
  const account = await scanAccount(accountId)
  .catch(err => res.status(500).send(err))
  return res.json(account)
}

const searchAccounts = async (req, res) => {
  const { term } = req.query
  const result = await searchAllAccounts(term)
  .catch(err => res.status(500).send(err))
  res.json(result)
}

module.exports = {
  getAccounts,
  getSingleAccount,
  editAccount,
  addAccount,
  scanOldAccount,
  searchAccounts
}