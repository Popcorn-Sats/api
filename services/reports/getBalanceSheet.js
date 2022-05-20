const { reportAccountTypes } = require('../../constants/account/index')
const { getAllAccounts, getAllAccountsByYear } = require('../account')

const getBalanceSheet = async (userId, year) => {
  const currentYear = new Date().getFullYear().toString()
  const isCurrentYear = year === currentYear

  const accounts = isCurrentYear ? await getAllAccounts(userId) : await getAllAccountsByYear(userId, year)

  const organizeAccountsBySubType = (subType) => {
    const accountsBySubType = subType.reduce((acc, account) => {
      const { reportAccountSubType } = account
      if (!acc[reportAccountSubType]) {
        acc[reportAccountSubType] = []
      }
      acc[reportAccountSubType].push(account)
      return acc
    }, {})
    return accountsBySubType
  }
  
  const currentAssets = accounts.filter(account => account.reportAccountType === reportAccountTypes.CURRENT_ASSET)
  const currentAssetsBySubType = organizeAccountsBySubType(currentAssets)
  const currentAssetsBySubTypeSum = Object.keys(currentAssetsBySubType).reduce((acc, curr) => {
    acc[curr] = currentAssetsBySubType[curr].reduce((acc2, curr2) => acc2 + curr2.balance, 0)
    return acc
  }, {})
  const currentAssetsBalance = currentAssets.reduce((acc, curr) => acc + curr.balance, 0)

  const fixedAssets = accounts.filter(account => account.reportAccountType === reportAccountTypes.FIXED_ASSET)
  const fixedAssetsBySubType = organizeAccountsBySubType(fixedAssets)
  const fixedAssetsBySubTypeSum = Object.keys(fixedAssetsBySubType).reduce((acc, curr) => {
    acc[curr] = fixedAssetsBySubType[curr].reduce((acc2, curr2) => acc2 + curr2.balance, 0)
    return acc
  }, {})
  const fixedAssetsBalance = fixedAssets.reduce((acc, curr) => acc + curr.balance, 0)

  const totalAssets = currentAssetsBalance + fixedAssetsBalance

  const currentLiabilities = accounts.filter(account => account.reportAccountType === reportAccountTypes.CURRENT_LIABILITY)
  const currentLiabilitiesBySubType = organizeAccountsBySubType(currentLiabilities)
  const currentLiabilitiesBySubTypeSum = Object.keys(currentLiabilitiesBySubType).reduce((acc, curr) => {
    acc[curr] = currentLiabilitiesBySubType[curr].reduce((acc2, curr2) => acc2 + curr2.balance, 0)
    return acc
  }, {})
  const currentLiabilitiesBalance = currentLiabilities.reduce((acc, curr) => acc + curr.balance, 0)

  const longTermLiabilities = accounts.filter(account => account.reportAccountType === reportAccountTypes.LONG_TERM_LIABILITY)
  const longTermLiabilitiesBySubType = organizeAccountsBySubType(longTermLiabilities)
  const longTermLiabilitiesBySubTypeSum = Object.keys(longTermLiabilitiesBySubType).reduce((acc, curr) => {
    acc[curr] = longTermLiabilitiesBySubType[curr].reduce((acc2, curr2) => acc2 + curr2.balance, 0)
    return acc
  }, {})
  const longTermLiabilitiesBalance = longTermLiabilities.reduce((acc, curr) => acc + curr.balance, 0)

  const totalLiabilities = currentLiabilitiesBalance + longTermLiabilitiesBalance

  const equity = accounts.filter(account => account.reportAccountType === reportAccountTypes.EQUITY)
  const equityBySubType = organizeAccountsBySubType(equity)
  const equityBySubTypeSum = Object.keys(equityBySubType).reduce((acc, curr) => {
    acc[curr] = equityBySubType[curr].reduce((acc2, curr2) => acc2 + curr2.balance, 0)
    return acc
  }, {})
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
      accounts: fixedAssetsBySubTypeSum
    },
    totalAssets: {
      balance: totalAssets,
    },
    currentLiabilities: {
      balance: currentLiabilitiesBalance,
      accounts: currentLiabilitiesBySubTypeSum
    },
    longTermLiabilities: {
      balance: longTermLiabilitiesBalance,
      accounts: longTermLiabilitiesBySubTypeSum
    },
    totalLiabilities: {
      balance: totalLiabilities,
    },
    equity: {
      balance: equityBalance,
      accounts: equityBySubTypeSum
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
