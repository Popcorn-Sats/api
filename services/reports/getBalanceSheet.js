const db = require('../../models')
const { reportAccountTypes } = require('../../constants/account/index')
const { getAllAccounts } = require('../account')

const getBalanceSheet = async (userId, year) => {
  const currentYear = new Date().getFullYear()
  const isCurrentYear = year === currentYear

  const organizeAccountsBySubType = (accounts) => {
    const accountsBySubType = accounts.reduce((acc, account) => {
      const { reportAccountSubType } = account
      if (!acc[reportAccountSubType]) {
        acc[reportAccountSubType] = []
      }
      acc[reportAccountSubType].push(account)
      return acc
    }, {})
    return accountsBySubType
  }

  const accounts = await getAllAccounts() // TODO: filter by userId / entityId
  .catch(err => console.log(err))
  
  const currentAssets = accounts.filter(account => account.reportAccountType === reportAccountTypes.CURRENT_ASSET)
  const currentAssetsBySubType = organizeAccountsBySubType(currentAssets)
  const currentAssetsBySubTypeSum = Object.keys(currentAssetsBySubType).reduce((acc, curr) => {
    acc[curr] = currentAssetsBySubType[curr].reduce((acc2, curr2) => acc2 + curr2.balance, 0)
    return acc
  }, {})
  const currentAssetsBalance = currentAssets.reduce((acc, curr) => acc + curr.balance, 0)

  const fixedAssets = accounts.filter(account => account.reportAccountType === reportAccountTypes.FIXED_ASSET)
  const fixedAssetsBalance = fixedAssets.reduce((acc, curr) => acc + curr.balance, 0)

  const totalAssets = currentAssetsBalance + fixedAssetsBalance

  const currentLiabilities = accounts.filter(account => account.reportAccountType === reportAccountTypes.CURRENT_LIABILITY)
  const currentLiabilitiesBalance = currentLiabilities.reduce((acc, curr) => acc + curr.balance, 0)

  const longTermLiabilities = accounts.filter(account => account.reportAccountType === reportAccountTypes.LONG_TERM_LIABILITY)
  const longTermLiabilitiesBalance = longTermLiabilities.reduce((acc, curr) => acc + curr.balance, 0)

  const totalLiabilities = currentLiabilitiesBalance + longTermLiabilitiesBalance

  const equity = accounts.filter(account => account.reportAccountType === reportAccountTypes.EQUITY)
  const equityBalance = equity.reduce((acc, curr) => acc + curr.balance, 0)

  const liabilitiesPlusEquity = totalLiabilities + equityBalance

  const check = totalAssets - liabilitiesPlusEquity

  const balanceSheet = {
    currentAssets: {
      balance: currentAssetsBalance,
      accounts: currentAssetsBySubTypeSum
    },
    fixedAssets: {
      balance: fixedAssetsBalance,
      accounts: fixedAssets
    },
    totalAssets: {
      balance: totalAssets,
    },
    currentLiabilities: {
      balance: currentLiabilitiesBalance,
      accounts: currentLiabilities
    },
    longTermLiabilities: {
      balance: longTermLiabilitiesBalance,
      accounts: longTermLiabilities
    },
    totalLiabilities: {
      balance: totalLiabilities,
    },
    equity: {
      balance: equityBalance,
      accounts: equity
    },
    liabilitiesPlusEquity: {
      balance: liabilitiesPlusEquity,
    },
    check: {
      balance: check,
    }
  }

  return balanceSheet
}

module.exports = {
  getBalanceSheet
}
