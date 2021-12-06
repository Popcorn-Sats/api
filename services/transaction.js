/* eslint-disable no-await-in-loop */
// Because transaction ledger loop awaits are dependent on each other
/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const _ = require('lodash')
const db = require('../models')
const { checkAndCreateAddress } = require('./address')
const { checkAndCreateBlock } = require('./block')
const { checkAndCreateCategory } = require('./category')
const { checkAndCreateUtxo } = require('./utxo')
const { getAddressTransactions } = require('./electrum')

const {Op} = Sequelize

// FIXME: copied here due to circular dependency with services/account calling services/transaction on initial sync
const checkAndCreateAccount = async (name) => {
  let accountId
  const errors = []
  const accountObj = await db.account.findOne({
    where: {
      name
    }
  })
  if (accountObj) {
    accountId = accountObj.dataValues.id
  } else {
    const newAccount = await db.account.create({
      name,
      birthday: new Date(), 
      accounttypeId: 3,
      active: true,
      owned: false
    })
    .catch(err => {
      errors.push(err)
      return errors
    })
    accountId = newAccount.dataValues.id
  }
  return accountId
}

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

const getTransactionLedgersByAccountID = async (accountId) => {
  const errors = []
  const ledgers = await db.transactionledger.findAll({
    where: {
      accountId
    }
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  return ledgers
}

const listTransactionsByAccountId = async (accountId) => {
  const transactions = []
  const ledgers = await getTransactionLedgersByAccountID(accountId)
  ledgers.forEach(ledger => {
    transactions.push(ledger.transactionId)
  });
  console.log(transactions)
  return transactions
}

const getAllTransactions = async () => {
  const errors = []
  const transactions = await db.transaction.findAll({
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
  if (!transactions) {
    return { failed: true, message: "No transactions were found" }
  }
  // TODO: Check which ledgers are for owned addresses, pass through transactiontype as result
  return transactions
}

const rawTransactionsByAccountID = async (accountId) => {
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
  return transactions
}

const getTransactionsByAccountID = async (accountId) => {
  const rawTransactions = await rawTransactionsByAccountID(accountId)
  const transactions = []
  if (!rawTransactions) {
    return { failed: true, message: "Transactions for account not found" }
  }
  const {length} = rawTransactions
  let runningBalance = 0
  for (let i = 0; i < length; i += 1) {
    const transaction = {}
    const ledgers = []
    rawTransactions[i].transactionledgers.forEach(ledger => {
      const thisLedger = {}
      thisLedger.accountId = ledger.accountId
      thisLedger.amount = ledger.amount
      thisLedger.transactiontypeId = ledger.transactiontypeId
      ledgers.push(thisLedger)
    })
    const accountInteger = parseInt(accountId, 10)
    const debits = _.sum(_.map(_.filter(_.filter(ledgers, {accountId: accountInteger}), {transactiontypeId: 1}), 'amount'))
    const credits = _.sum(_.map(_.filter(_.filter(ledgers, {accountId: accountInteger}), {transactiontypeId: 2}), 'amount'))
    transaction.id = rawTransactions[i].id
    transaction.txid = rawTransactions[i].txid
    transaction.network_fee = rawTransactions[i].network_fee
    transaction.size = rawTransactions[i].size
    transaction.description = rawTransactions[i].description
    transaction.block = rawTransactions[i].block
    transaction.transactiontype = rawTransactions[i].transactiontype
    transaction.transactionledgers = rawTransactions[i].transactionledgers
    transaction.balance_change = credits - debits
    transaction.runningBalance = runningBalance + transaction.balance_change
    runningBalance = transaction.runningBalance
    transactions.push(transaction)
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
  const { blockHeight, txid, address, network_fee, size, description, sender, category, recipient, ledgers } = transaction
  const errors = []
  let categoryid
  let blockId
  let senderId
  let recipientId

  // Validate required fields
  if( !ledgers || !sender || !recipient) {
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
    let accountId
    if (rawLedger.accountId) {
      accountId = rawLedger.accountId
    } else if (rawLedger.name) {
      accountId = await checkAndCreateAccount(rawLedger.name)
    }
    const ledger = {
      amount: rawLedger.amount,
      accountId,
      transactiontypeId: rawLedger.transactiontypeId,
      utxoId: await checkAndCreateUtxo(rawLedger.utxo, rawLedger.address, accountId),
      addressId: await checkAndCreateAddress(rawLedger.address)
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
        sender, 
        recipient
    })
  }
  // Insert into table
  let newTransaction = await db.transaction.create({
      blockId, 
      txid, 
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

const createAddressTransactions = async (address, accountId) => {
  console.log(address)
  console.log("We are in createTransactionsForAddress")
  const transactionsArray = []
  const transactions = await getAddressTransactions(address)
  const {length} = transactions
  for (let i = 0; i < length; i += 1) {
    const transaction = {}
    transaction.blockHeight = transactions[i].blockHeight
    transaction.txid = transactions[i].txid
    transaction.network_fee = transactions[i].fee
    transaction.size = transactions[i].size
    transaction.sender = "Redundant"
    transaction.recipient = "Redundant"
    transaction.ledgers = []
    for (let j = 0; j < transactions[i].vinArray.length; j += 1) {
      const ledger = {
        accountId: transactions[i].vinArray[j].scriptPubKey.address === address ? accountId : null, // TODO: lazy, check db
        transactiontypeId: 1,
        amount: transactions[i].vinArray[j].value * 100000000,
        utxo: `${transactions[i].vin[j].txid}[${transactions[i].vinArray[j].n}]`,
        address: transactions[i].vinArray[j].scriptPubKey.address
      }
      console.log({ledger})
      transaction.ledgers.push(ledger)
    }
    for (let k = 0; k < transactions[i].vout.length; k += 1) {
      const ledger = {
        accountId: transactions[i].vout[k].scriptPubKey.address === address ? accountId : null, // TODO: lazy, check db
        transactiontypeId: 2,
        amount: transactions[i].vout[k].value * 100000000,
        utxo: `${transactions[i].txid}[${transactions[i].vout[k].n}]`,
        address: transactions[i].vout[k].scriptPubKey.address
      }
      console.log({ledger})
      transaction.ledgers.push(ledger)
    }
    transactionsArray.push(transaction)
    console.log({transaction})
    console.log('createTransaction beginning …')
    const result = await createTransaction(transaction)
    console.log(result)
  }
  return transactionsArray
}

module.exports = {
  getAllTransactions,
  getTransactionLedgersByAccountID,
  getTransactionsByAccountID,
  getTransactionByID,
  editFullTransaction,
  searchAllTransactions,
  createTransaction,
  createAddressTransactions,
}