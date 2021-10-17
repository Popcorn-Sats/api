/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const { checkAndCreateAccount } = require('./account')
const { checkAndCreateBlock } = require('./block')
const { checkAndCreateCategory } = require('./category')

const {Op} = Sequelize

const transactionByUUID = async (id) => {
  console.log("Getting by UUID: ", id)
  const errors = []
  const transaction = await db.transaction.findAll({
    where: {
        id
    },
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
  return transaction
}

const listTransactionsByAccountId = async (accountId) => {
  const errors = []
  const transactions = []
  const ledgers = await db.transactionledger.findAll({
    where: {
      accountId
    }
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  ledgers.forEach(ledger => {
    transactions.push(ledger.transactionId)
  });
  console.log(transactions)
  return transactions
}

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
  const transactionList = await listTransactionsByAccountId(accountId)
  .catch(err => {
    errors.push(err)
    return errors
  })
  const transactions = await db.transaction.findAll({
    where: {
      id: {
        [Op.in]: transactionList
      }
    },
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
    return { failed: true, message: "Transactions for account not found" }
  }
  return transactions
}

// TODO: get single specified transaction for detailed view/editing. Cut excess from higher order services (e.g. per account)
module.exports.getTransactionByID = async (id) => {
  const transaction = await transactionByUUID(id)
  return transaction
}

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
      // { '$block.height$': { [Op.iLike]: `%${  parseInt(term, 10)  }%` } },
      { txid: { [Op.iLike]: `%${  term  }%` } }
  ]},
  include: [
    { model: db.category },
    // { model: db.block },
  ]})
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
    if (categoryid.errors) {return { failed: true, message: categoryid.errors }}
  }

  if (sender) {
    senderId = await checkAndCreateAccount(sender)
    if (senderId.errors) {return { failed: true, message: senderId.errors }}
  }

  if (recipient) {
    recipientId = await checkAndCreateAccount(recipient)
    if (recipientId.errors) {return { failed: true, message: recipientId.errors }}
  }

  if (blockHeight) {
    blockId = await checkAndCreateBlock(blockHeight)
    if (blockId.errors) {return { failed: true, message: blockId.errors }}
  }

  // Check for  errors
  if (errors.length > 0) {
      return ('add', {
        balance_change, 
        sender, 
        recipient
    })
  }
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
              transactiontypeId: 2
          },
          {
              // Sender
              // TODO: how to deal with multiple signers
              id: ledgerDebitIndex,
              accountId: senderId,
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
