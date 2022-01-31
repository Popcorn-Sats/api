const { formatTransactionsObject } = require('./formatTransactionsObject')

const db = require('../../models')

const getTransactionsByCategory = async (categoryId) => {
  console.log({"message": "working"})
  const errors = []
  const rawTransactions = await db.transaction.findAll({
    where: {
      categoryid: categoryId
    },
    order: [
      ['id', 'DESC'],
    ],
    include: [
        {
            model: db.category,
        },
        {
            model: db.block,
        },
        {
            model: db.transactiontype,
        },
        {
            model: db.transactionledger,
            include: [db.account, db.utxo]
        }
    ]
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!rawTransactions) {
    return { failed: true, message: "Transactions for category not found" }
  }
  const transactions = await formatTransactionsObject(rawTransactions)
  return transactions
}

module.exports = {
  getTransactionsByCategory
}