const db = require('../../models')
const { reportAccountTypes } = require('../../constants/account/index')
const { getAllAccounts } = require('../account')

const getBalanceSheet = async (userId, year) => {
  const currentYear = new Date().getFullYear()
  const isCurrentYear = year === currentYear

  const accounts = await getAllAccounts() // TODO: filter by userId
  .catch(err => console.log(err))
  
  const currentAssets = accounts.filter(account => account.type === reportAccountTypes.CURRENT_ASSET)
  const currentAssetsBalance = currentAssets.reduce((acc, curr) => acc + curr.balance, 0)

  const fixedAssets = accounts.filter(account => account.type === 'fixedAsset')
  const fixedAssetsBalance = fixedAssets.reduce((acc, curr) => acc + curr.balance, 0)

  const currentLiabilities = accounts.filter(account => account.type === 'currentLiability')
  const currentLiabilitiesBalance = currentLiabilities.reduce((acc, curr) => acc + curr.balance, 0)

  const longTermLiabilities = accounts.filter(account => account.type === 'longTermLiability')
  const longTermLiabilitiesBalance = longTermLiabilities.reduce((acc, curr) => acc + curr.balance, 0)

  const equity = accounts.filter(account => account.type === 'equity')
  const equityBalance = equity.reduce((acc, curr) => acc + curr.balance, 0)

  const balanceSheet = accounts.map(account => ({
      name: account.name,
      balance: account.balance
    }))
  return balanceSheet
}

module.exports = {
  getBalanceSheet
}
