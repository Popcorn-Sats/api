/* eslint-disable camelcase */
/* eslint-disable no-console */
const db = require('../models')
const { checkAndCreateAccount } = require('./account')
const { checkAndCreateBlock } = require('./block')
const { checkAndCreateCategory } = require('./category')


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

// TODO: get single specified transaction for detailed view/editing. Cut excess from higher order services (e.g. per account)
module.exports.getTransactionByID = async (id) => id

module.exports.editFullTransaction = async (transaction) => {
  const { 
    id,
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
  } = transaction
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

// TODO: Break up all this shit across other services
module.exports.createTransaction = async (transaction) => {
  const { blockHeight, txid, balance_change, address, network_fee, size, description, sender, category, recipient } = transaction
  const errors = []
  let categoryid
  let blockId
  let senderId
  let recipientId

  // Validate required fields
  if(!balance_change || !sender || !recipient) {
    return { failed: true, message: "Missing required field(s)" }
      // res.status(400).send()
  }

  if (category) {
    categoryid = await checkAndCreateCategory(category)
  }

  if (sender) {
    senderId = await checkAndCreateAccount(sender)
    // console.log("Received senderId: ", senderId)
  }

  if (recipient) {
    recipientId = await checkAndCreateAccount(recipient)    
  }

  if (blockHeight) {
    blockId = await checkAndCreateBlock(blockHeight)
  }

  // Check for  errors
  if (errors.length > 0) {
      /* res.send('add', {
          balance_change, 
          sender, 
          recipient
      }) */
      return ('add', {
        balance_change, 
        sender, 
        recipient
    })
  }
  // Find transaction index
  // TODO: this is a stupid amount of data to get one ID. Can Sequelize reduce the burden?
  let transactionsIndex
  await db.transaction.findAll({
      order: [
          ['id', 'ASC'],
      ],
  })
  .then (transactions => {
      transactionsIndex = transactions[transactions.length - 1].dataValues.id + 1
  })
  // Find transactionledger index
  let ledgerDebitIndex
  let ledgerCreditIndex
  await db.transactionledger.findAll({
      order: [
          ['id', 'ASC'],
      ],
  })
  .then (ledgers => {
      ledgerCreditIndex = ledgers[ledgers.length - 1].dataValues.id + 1
      ledgerDebitIndex = ledgerCreditIndex + 1
  })
  // Insert into table
  const newTransaction = await db.transaction.create({
      id: transactionsIndex,
      blockId, 
      txid, 
      balance_change, 
      address, 
      network_fee, 
      size, 
      description, 
      categoryid, 
      transactionledgers: [
          {
              // Recipient
              // TODO: how to deal with split recipients (e.g. network fees, PayJoin, exchange payouts)
              id: ledgerCreditIndex,
              accountId: recipientId,
              transactionId: transactionsIndex,
              transactiontypeId: 2
          },
          {
              // Sender
              // TODO: how to deal with multiple signers
              id: ledgerDebitIndex,
              accountId: senderId,
              transactionId: transactionsIndex,
              transactiontypeId: 1
          }
      ]
  }, {
      include: [
          {
              model: db.transactionledger
          }
      ]
  })
  return newTransaction
  // .then(transaction => res.json(transaction).send())
  // .catch(err => console.log(err));
}