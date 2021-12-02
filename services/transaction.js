/* eslint-disable no-await-in-loop */
// Because transaction ledger loop awaits are dependent on each other
/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const _ = require('lodash')
const db = require('../models')
const { checkAndCreateAccount } = require('./account')
const { checkAndCreateBlock } = require('./block')
const { checkAndCreateCategory } = require('./category')
const { checkAndCreateUtxo } = require('./utxo')

const {Op} = Sequelize

const transactionByUUID = async (id) => {
  const errors = []
  const transaction = await db.transaction.findOne({
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
          include: [
            {
              model: db.account
            },
            {
              model: db.utxo,
              include: [
                {
                  model: db.address
                }
              ]
            }
          ]
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

const getAllTransactions = async () => {
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
            include: [db.account, db.utxo]
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

const getTransactionsByAccountID = async (accountId) => {
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
            include: [db.account, db.utxo]
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

const getTransactionByID = async (id) => {
  const transaction = await transactionByUUID(id)
  return transaction
}

const editFullTransaction = async (transaction) => {
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
// TODO: Add transaction ledger logic
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!editedTransaction) {
    return { failed: true, message: "Transaction to edit not found" }
  }
  return editedTransaction
}

const searchAllTransactions = async (term) => {
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

const balanceLedgers = async (ledgers) => {
  const debits = _.sum(_.map(_.filter(ledgers, {transactiontypeId: 1}), 'amount'))
  const credits = _.sum(_.map(_.filter(ledgers, {transactiontypeId: 2}), 'amount'))
  return credits === debits
}

const createTransaction = async (transaction) => {
  const { blockHeight, txid, balance_change, address, network_fee, size, description, sender, category, recipient, ledgers } = transaction
  const errors = []
  let categoryid
  let blockId
  let senderId
  let recipientId

  // Validate required fields
  if( !ledgers || !balance_change || !sender || !recipient) {
    return { failed: true, message: "Missing required field(s)" }
  } // TODO: balance change should be on a per-account basis by the front end, checking which ledger applies. Same w/ senders/recipients

  const transactionledgers = []

  transactionledgers.push({
    // Fee
    accountId: 0,
    transactiontypeId: 2,
    amount: network_fee
  })

  for(let i = 0; i < ledgers.length; i += 1) {
    const rawLedger = ledgers[i]
    const accountId = await checkAndCreateAccount(rawLedger.name)
    const ledger = {
      amount: rawLedger.amount,
      accountId,
      transactiontypeId: rawLedger.transactiontypeId,
      utxoId: await checkAndCreateUtxo(rawLedger.utxo, rawLedger.address, accountId)
    }
    transactionledgers.push(ledger)
  }

  const ledgersBalanced = await balanceLedgers(transactionledgers)

  if (!ledgersBalanced) {
    errors.push("Ledgers don't balance")
    return {failed: true, message: "Ledgers don't balance", errors}
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
  // Insert into table
  let newTransaction = await db.transaction.create({
      blockId, 
      txid, 
      balance_change, 
      address, 
      network_fee, 
      size, 
      description, 
      categoryid, 
      transactionledgers
  }, {
      include: [
          {
              model: db.transactionledger
          }
      ]
  })
  newTransaction = await transactionByUUID(newTransaction.id)
  return newTransaction
}

module.exports = {
  getAllTransactions,
  getTransactionsByAccountID,
  getTransactionByID,
  editFullTransaction,
  searchAllTransactions,
  createTransaction
}