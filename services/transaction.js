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
    order: [
      ['id', 'ASC'],
    ],
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
    transaction.category = rawTransactions[i].category
    transaction.transactiontype = rawTransactions[i].transactiontype
    transaction.transactionledgers = rawTransactions[i].transactionledgers
    transaction.balance_change = credits - debits
    transaction.runningBalance = runningBalance + transaction.balance_change
    runningBalance = transaction.runningBalance
    transactions.push(transaction)
  }
  return transactions.reverse()
}

const getTransactionsByCategoryID = async (categoryId) => {
  const errors = []
  const transactions = await db.transaction.findAll({
    where: {
      categoryid: categoryId
    }
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  return transactions
}

const getTransactionByID = async (id) => {
  const transaction = await transactionByUUID(id)
  const returnTransaction = {}
  returnTransaction.id = transaction.id
  returnTransaction.txid = transaction.txid
  returnTransaction.network_fee = transaction.network_fee
  returnTransaction.size = transaction.size
  returnTransaction.description = transaction.description
  returnTransaction.category = transaction.category
  returnTransaction.block = transaction.block
  returnTransaction.transactiontype = transaction.transactiontype
  returnTransaction.debitsLedger = _.filter(transaction.transactionledgers, {transactiontypeId: 1})
  returnTransaction.creditsLedger = _.filter(transaction.transactionledgers, {transactiontypeId: 2})
  return returnTransaction
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
  const { blockHeight, txid, network_fee, size, description, category, ledgers } = transaction
  const errors = []
  let categoryid
  let blockId

  // Validate required fields
  if( !ledgers ) {
    return { failed: true, message: "Missing required field(s)" }
  }

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

  if (blockHeight) {
    blockId = await checkAndCreateBlock(blockHeight)
    if (blockId.errors) {return { failed: true, message: blockId.errors }}
  }

  // Insert into table
  let newTransaction = await db.transaction.create({
      blockId, 
      txid, 
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
    const transactionExists = db.transaction.findOne({
      where: {
        txid: transactions[i].txid
      }
    })
    if (transactionExists) {
      const transaction = await editFullTransaction(transactions[i]) // TODO: Next task
      return transaction
    }
    const transaction = {}
    transaction.blockHeight = transactions[i].blockHeight
    transaction.txid = transactions[i].txid
    transaction.network_fee = transactions[i].fee
    transaction.size = transactions[i].size
    transaction.ledgers = []
    const ledgerAccountID = async (scriptAddress) => {
      if (scriptAddress === address) {
        return accountId
      }
      const accountCheck = await db.address.findOne({
        where: {
          address
        }
      })
      if (accountCheck) {
        return accountCheck.id
      }
      return null
    }
    for (let j = 0; j < transactions[i].vinArray.length; j += 1) {
      const ledger = {
        accountId: await ledgerAccountID(transactions[i].vinArray[j].scriptPubKey.address),
        transactiontypeId: 1,
        amount: transactions[i].vinArray[j].value * 100000000, // Note: sats the standard, but also fixes JS floating point fuckery
        utxo: `${transactions[i].vin[j].txid}[${transactions[i].vinArray[j].n}]`,
        address: transactions[i].vinArray[j].scriptPubKey.address
      }
      console.log({ledger})
      transaction.ledgers.push(ledger)
    }
    for (let k = 0; k < transactions[i].vout.length; k += 1) {
      const ledger = {
        accountId: await ledgerAccountID(transactions[i].vout[k].scriptPubKey.address),
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
  getTransactionsByCategoryID,
  getTransactionByID,
  editFullTransaction,
  searchAllTransactions,
  createTransaction,
  createAddressTransactions,
}