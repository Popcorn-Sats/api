const db = require('../models')

module.exports.getTransactionsByAccount = async (accountId) => {
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