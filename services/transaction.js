const db = require('../models')

module.exports.getAllTransactions = async () => {
  const transactions = await db.transaction.findAll({
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
            include: [db.account]
        }
    ]
  })
  if (!transactions) {
    return { failed: true, message: "No transactions were found" }
  }
  return transactions
}

module.exports.getTransactionsByAccountID = async (accountId) => {
  const transactions = await db.transaction.findAll(
    {
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
                include: [db.account],
                where: {
                  accountId
                }
                // This only brings over the single ledger.
                // Wider scope needed
                // Consider running a small script 
                // like this to find the txids. Then grab those txns?
            }
        ]
    }, {
        where: {
            include: [
                {
                    model: db.transactionledger,
                    where: {
                        accountId
                    }
                }
            ]
        }
    }
  )
  if (!transactions) {
    return { failed: true, message: "Transactions for account not found" }
  }
  return transactions
}

module.exports.editFullTransaction = async (transaction) => {
  // eslint-disable-next-line camelcase
  const { id, date, description, category, payee, block_height, txid, balance_change, account, address, fee, size } = transaction
  const errors = []

  db.transaction.update(
    { 
        date,
        description, 
        category, 
        payee, 
        block_height, 
        txid, 
        balance_change, 
        account, 
        address, 
        fee, 
        size 
    }, {
        where: {
            id
        }
    }
  )

  .catch(err => {
    errors.push(err)
    // res(errors)
    // console.log(err)
  })

  return transaction
}