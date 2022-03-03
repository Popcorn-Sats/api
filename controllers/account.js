/* eslint-disable no-console */
const { getAllAccounts, getNetPosition, editAccountById, deleteAccountById, createAccount, searchAllAccounts, getAccountById, scanAccount } = require('../services/account')

// TODO: Error handling

const getAccounts = async (req, res) => {
  const accounts = await getAllAccounts()
  .catch(err => res.status(500).send(err))
  res.header('Content-Range', 'bytes : 0-9/1971') // TODO: Get the actual range
  return res.json(accounts)
}

const getPosition = async (req, res) => {
  const balance = await getNetPosition()
  .catch(err => res.status(500).send(err))
  return res.json(balance)
}

const getSingleAccount = async (req, res) => {
  const {accountId} = req.params
  const account = await getAccountById(accountId)
  .catch(err => res.status(500).send(err))
  return res.json(account)
}

const editAccount = async (req, res) => {
  const { id } = req.params
  const account = req.body
  const editedAccount = await editAccountById(account, id)
  .catch(err => res.status(500).send(err))
  return res.json(editedAccount)
}

const deleteAccount = async (req, res) => {
  const {id} = req.params
  const deletedAccount = await deleteAccountById(id)
  .catch(err => res.status(500).send(err))
  return res.json(deletedAccount)
}

const addAccount = async (req, res) => {
  const account = req.body
  const newAccount = await createAccount(account)
  .catch(err => res.status(500).send(err))
  return res.json(newAccount)
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
  getPosition,
  getSingleAccount,
  editAccount,
  deleteAccount,
  addAccount,
  scanOldAccount,
  searchAccounts
}