/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const { checkAndCreateAccount } = require('./account')
const { checkAndCreateBlock } = require('./block')
const { checkAndCreateCategory } = require('./category')

const {Op} = Sequelize


module.exports.getAllTransactions = async () => {
  const errors = []
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
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!transactions) {
    return { failed: true, message: "No transactions were found" }
  }
  return transactions
}

module.exports.getTransactionsByAccountID = async (accountId) => {
  const errors = []
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
                // FIXME: This only brings over the single ledger.
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
  .catch(err => {
    errors.push(err)
    return errors
  })
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

  const editedTransaction = await db.transaction.update(
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
    return errors
  })
  if (!editedTransaction) {
    return { failed: true, message: "Transaction to edit not found" }
  }
  return editedTransaction
}

module.exports.searchAllTransactions = async (term) => {
  const errors = []
  const result = await db.transaction.findAll({ where: {[Op.or]: [
      { '$category.name$': { [Op.iLike]: `%${  term  }%` } },
      { description: { [Op.iLike]: `%${  term  }%` } },
      // { payee: { [Op.iLike]: `%${  term  }%` } },
      // { block_height: { [Op.iLike]: `%${  term  }%` } },
      // { txid: { [Op.iLike]: `%${  term  }%` } },
      // { account: { [Op.iLike]: `%${  term  }%` } },
      // { address: { [Op.iLike]: `%${  term  }%` } }
  ]},
  include: [{ model: db.category }]})
  .catch(err => {
    errors.push(err)
  })
  return(result)
}

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
}
