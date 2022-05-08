module.exports.accountTypes = {
  FEES: {
    key: 0,
    name: 'Fees',
  },
  WALLET: {
    key: 1,
    name: 'Wallet',
  },
  VAULT: {
    key: 2,
    name: 'Vault',
  },
  EXPENSE: {
    key: 3,
    name: 'Expense',
  },
  INCOME: {
    key: 4,
    name: 'Income',
  },
  LIABILITY: {
    key: 5,
    name: 'Liability',
  },
}

module.exports.reportAccountTypes = {
  CURRENT_ASSET: 'currentAsset',
  FIXED_ASSET: 'fixedAsset',
  CURRENT_LIABILITY: 'currentLiability',
  LONG_TERM_LIABILITY: 'longTermLiability',
  EQUITY: 'equity',
}

module.exports.reportAccountSubTypes = {
  // CURRENT_ASSET
  CASH: 'cash',
  ACCOUNTS_RECEIVABLE: 'accountsReceivable',
  INVENTORY: 'inventory',
  PREPAID_EXPENSES: 'prepaidExpenses',
  // FIXED_ASSET
  LAND: 'land',
  EQUIPMENT: 'equipment',
  ACCUMULATED_DEPRECIATION: 'accumulatedDepreciation',
  // CURRENT_LIABILITY
  ACCOUNTS_PAYABLE: 'accountsPayable',
  ACCRUED_LIABILITIES: 'accruedLiabilities',
  DEFFERRED_REVENUES: 'deferredRevenues',
  // LONG_TERM_LIABILITY
  NOTES_PAYABLE: 'notesPayable',
  MORTGAGE: 'mortgage',
  // EQUITY
  CAPITAL_STOCK: 'capitalStock',
  RETURN_ASSET: 'returnAsset',
  // OTHER
  OTHER_CURRENT_ASSET: 'otherCurrentAsset',
  OTHER_FIXED_ASSET: 'otherFixedAsset',
  OTHER_CURRENT_LIABILITY: 'otherCurrentLiability',
  OTHER_LONG_TERM_LIABILITY: 'otherLongTermLiability',
  OTHER_EQUITY: 'otherEquity',
}
