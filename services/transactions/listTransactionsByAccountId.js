const db = require('../../models')

const listTransactionsByAccountId = async (accountId) => {
  const transactions = []
  const ledgers = await db.transactionledger.getTransactionLedgersByAccountID(accountId)
  ledgers.forEach(ledger => {
    transactions.push(ledger.transactionId)
  });
  return transactions
}

module.exports = {
  listTransactionsByAccountId,
}
