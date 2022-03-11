const { formatTransactionsObject } = require('./formatTransactionsObject')
const { paginate } = require('../../utils/paginate')

const db = require('../../models')

const getTransactionsByCategoryId = async (categoryId) => {
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
  const transactions = await formatTransactionsObject({ rawTransactions })
  return transactions
}

const getTransactionsByCategoryIdPaginated = async (categoryId, page, perPage) => {
  const errors = []
  const rawTransactions = await db.transaction.findAndCountAll({
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
    ],
    distinct: true, // Needed to get correct count
    ...paginate({ page, perPage })
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!rawTransactions) {
    return { failed: true, message: "Transactions for category not found" }
  }
  const transactions = await formatTransactionsObject({ rawTransactions: rawTransactions.rows }) // FIXME: Add running balance
  return {transactions, count: rawTransactions.count}
}

module.exports = {
  getTransactionsByCategoryId,
  getTransactionsByCategoryIdPaginated
}