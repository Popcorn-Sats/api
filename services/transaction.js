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
const { formatTransactionsObject } = require('./transactions/formatTransactionsObject')
const { getInitialBalance, getInitialAccountBalance } = require('./transactions/getInitialBalance') // FIXME: DRY
const { getTransactionType } = require('./transactions/getTransactionType')
const { listTransactionsByAccountId } = require('./transactions/listTransactionsByAccountId')
const { paginate } = require('../utils/paginate')
const { checkAndCreateAccount } = require('./accounts/checkAndCreateAccount')

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

const getAllTransactions = async () => {
  const errors = []
  const rawTransactions = await db.transaction.findAll({
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
    return { failed: true, message: "No transactions were found" }
  }
  const transactions = await formatTransactionsObject({ rawTransactions })
  return transactions
}

const getAllTransactionsPaginated = async (page, perPage, sort, order, filter) => {
  const rawTransactions = await db.transaction.getAllTransactionsPaginated(page, perPage, sort, order, filter)
  console.log({rawTransactions})
  if (!rawTransactions) {
    console.log({ failed: true, message: "No transactions were found" })
    return { failed: true, message: "No transactions were found" }
  }
  const offset = rawTransactions.count < page * perPage ? 0 : page * perPage
  const limit = rawTransactions.count < page * perPage ? 0 : rawTransactions.count - page * perPage
  const initialBalance = await getInitialBalance({ offset, limit }) // FIXME: Broken, need to be ordered by blockHeight?
  const transactions = await formatTransactionsObject({ rawTransactions: rawTransactions.rows, initialBalance })
  return {transactions, count: rawTransactions.count}
}

const rawTransactionsByAccountID = async (accountId, page, perPage) => {
  const errors = []
  const transactionList = await listTransactionsByAccountId(accountId)
  .catch(err => {
    errors.push(err)
    return errors
  })
  const transactions = await db.transaction.findAndCountAll({
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
    ],
    distinct: true, // Needed to get correct count
    ...paginate({ page, perPage })
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  return transactions
}

const getTransactionsByAccountID = async (accountId, page, perPage) => {
  const rawTransactions = await rawTransactionsByAccountID(accountId, page, perPage)
  if (!rawTransactions) {
    return { failed: true, message: "Transactions for account not found" }
  }
  const offset = rawTransactions.count < page * perPage ? 0 : page * perPage
  const limit = rawTransactions.count < page * perPage ? 0 : rawTransactions.count - page * perPage
  const initialBalance = await getInitialAccountBalance({ accountId, offset, limit }) // FIXME: Broken for CoinJoin
  const transactions = await formatTransactionsObject({ rawTransactions: rawTransactions.rows, accountId, initialBalance })
  return {transactions, count: rawTransactions.count}
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
  returnTransaction.timestamp = parseInt(transaction.block.timestamp, 10) * 1000
  returnTransaction.transactiontype = await getTransactionType(transaction.transactionledgers)
  returnTransaction.debitsLedger = _.filter(transaction.transactionledgers, {transactiontypeId: 1})
  returnTransaction.creditsLedger = _.filter(transaction.transactionledgers, {transactiontypeId: 2})
  return returnTransaction
}

const syncLedgerAccountId = async (accountId) => {
  const addresses = await db.address.findAll({
    where: {
      accountId
    }
  })
  // console.log(addresses)
  for (let j = 0; j < addresses.length; j += 1) {
    const ledgers = await db.transactionledger.update({
      accountId
    }, {
      where: {
        addressId: addresses[j].id
      }
    })
    // eslint-disable-next-line no-unused-expressions
    ledgers ? console.log({message: `Synced ledgers`, accountId, addressId: addresses[j].id}) : console.error({message: `Failed to sync ledgers`, accountId, addressId: addresses[j].id})
  }
}

const syncLedgers = async (transactionledgers) => {
  for (let j = 0; j < transactionledgers.length; j += 1) {
    const {addressId, accountId} = transactionledgers[j]
    const ledgers = await db.transactionledger.update({
      accountId
    }, {
      where: {
        addressId
      }
    })
    // eslint-disable-next-line no-unused-expressions
    ledgers ? console.log({message: `Synced ledgers`, accountId, addressId}) : console.error({message: `Failed to sync ledgers`, accountId, addressId})
  }
}

const balanceLedgers = async (ledgers) => {
  const debits = _.sum(_.map(_.filter(ledgers, {transactiontypeId: 1}), 'amount'))
  const credits = _.sum(_.map(_.filter(ledgers, {transactiontypeId: 2}), 'amount'))
  return credits === debits
}

const editFullTransaction = async (transaction, id) => {
  const { blockHeight, blockId, txid, network_fee, size, description, category, categoryid, ledgers } = transaction
  console.log({message: "editing transaction"})
  console.log({transaction})
  const errors = []
  let checkCategoryId
  let checkBlockId
  
  // Validate required fields
  if( !id ) {
    return { failed: true, message: "Missing required field(s)" }
  }

  const transactionledgers = []

  // TODO: When receiving from webapp we have pre-configured debitsLedger and creditsLedger. concatenate these into `ledgers` in the controller
  if (ledgers) {
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
        await db.address.update({
          accountId
        }, {
          where: {
            id: rawLedger.addressId
          }
        })
      }
      if (rawLedger.id) {
        const addressId = rawLedger.addressId || await checkAndCreateAddress(rawLedger.address, accountId)
        await db.transactionledger.update({
          amount: rawLedger.amount,
          accountId,
          transactiontypeId: rawLedger.transactiontypeId,
          utxoId: rawLedger.utxoId || await checkAndCreateUtxo(rawLedger.utxo, addressId),
          addressId
        }, {
          where: {
            id: rawLedger.id
          }
        })
      }
      const addressId = rawLedger.addressId || await checkAndCreateAddress(rawLedger.address, accountId)
      const ledger = {
        amount: rawLedger.amount,
        accountId,
        transactiontypeId: rawLedger.transactiontypeId,
        utxoId: rawLedger.utxoId || await checkAndCreateUtxo(rawLedger.utxo, addressId),
        addressId
      }
      console.log({"Edit TX ledger account ID": ledger.accountId})
      transactionledgers.push(ledger)
    }

    const ledgersBalanced = await balanceLedgers(transactionledgers)

    if (!ledgersBalanced) {
      errors.push("Ledgers don't balance")
      return {failed: true, message: "Ledgers don't balance", errors}
    }
  }

  if (category && !categoryid) {
    const categoryName = category.name ? category.name : category
    checkCategoryId = await checkAndCreateCategory(categoryName)
    if (checkCategoryId.errors) {return { failed: true, message: checkCategoryId.errors }}
  }

  if (blockHeight && !blockId) {
    checkBlockId = await checkAndCreateBlock(blockHeight)
    if (checkBlockId.errors) {return { failed: true, message: checkBlockId.errors }}
  }

  let editedTransaction = await db.transaction.update({
      blockId: blockId || checkBlockId, 
      txid, 
      network_fee, 
      size, 
      description, 
      categoryid: categoryid || checkCategoryId, 
      transactionledgers
  }, {
      where: {
        id
      }
  }, {
      include: [
          {
              model: db.transactionledger
          }
      ]
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!editedTransaction) {
    return { failed: true, message: "Transaction to edit not found" }
  }

  const syncedLedgers = await syncLedgers(transactionledgers)
  if (!syncedLedgers) {
    console.log({message: "No transactions ledgers to sync"})
  }

  editedTransaction = await transactionByUUID(id)
  return editedTransaction
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
    const addressId = await checkAndCreateAddress(rawLedger.address)
    const ledger = {
      amount: rawLedger.amount,
      accountId,
      transactiontypeId: rawLedger.transactiontypeId,
      utxoId: await checkAndCreateUtxo(rawLedger.utxo, addressId),
      addressId
    }
    console.log({"Create TX ledger account ID": ledger.accountId})
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

  const syncedLedgers = await syncLedgers(transactionledgers)
  if (!syncedLedgers) {
    console.log({message: "No transactions ledgers to sync"})
  }

  newTransaction = await transactionByUUID(newTransaction.id)
  return newTransaction
}

const createAddressTransactions = async (address, accountId) => {
  console.log({message: "createAddressTransactions", address})
  const transactionsArray = []
  const transactions = await getAddressTransactions(address)
  const {length} = transactions // FIXME: handle empty wallets
  for (let i = 0; i < length; i += 1) {
    console.log({message: `making transaction ${i}`})
    const transaction = {}
    transaction.blockHeight = transactions[i].blockHeight
    transaction.txid = transactions[i].txid
    transaction.network_fee = Math.round(transactions[i].fee)
    transaction.size = transactions[i].size
    transaction.ledgers = []
    const ledgerAccountID = async (scriptAddress) => {
      console.log({message: `finding accountID for ${scriptAddress}`})
      if (scriptAddress === address) {
        console.log({message: `scriptAddress === address gives account ID ${accountId}`})
        return accountId
      }
      const accountCheck = await db.address.findOne({
        where: {
          address: scriptAddress
        }
      })
      if (accountCheck) {
        console.log({message: `accountCheck gives account ID ${accountCheck.accountId}`})
        return accountCheck.accountId
      }
      console.log({message: `no account found for address`})
      return null
    }
    for (let j = 0; j < transactions[i].vinArray.length; j += 1) {
      const ledger = {
        accountId: await ledgerAccountID(transactions[i].vinArray[j].scriptPubKey.address),
        transactiontypeId: 1,
        amount: Math.round(transactions[i].vinArray[j].value * 100000000), // Note: sats the standard, but also fixes JS floating point fuckery
        utxo: `${transactions[i].vin[j].txid}[${transactions[i].vinArray[j].n}]`,
        address: transactions[i].vinArray[j].scriptPubKey.address
      }
      console.log({"ledger account ID": ledger.accountId})
      transaction.ledgers.push(ledger)
    }
    for (let k = 0; k < transactions[i].vout.length; k += 1) {
      const ledger = {
        accountId: await ledgerAccountID(transactions[i].vout[k].scriptPubKey.address),
        transactiontypeId: 2,
        amount: Math.round(transactions[i].vout[k].value * 100000000),
        utxo: `${transactions[i].txid}[${transactions[i].vout[k].n}]`,
        address: transactions[i].vout[k].scriptPubKey.address
      }
      console.log({"ledger account ID": ledger.accountId})
      transaction.ledgers.push(ledger)
    }
    transactionsArray.push(transaction)
    const transactionExists = await db.transaction.findOne({
      where: {
        txid: transactions[i].txid
      }
    })
    if (transactionExists) {
      console.log({message: 'editFullTransaction beginning …'})
      const editedTransaction = await editFullTransaction(transaction, transactionExists.id)
      // eslint-disable-next-line no-unused-expressions
      editedTransaction ? console.log({message: `Transaction ${transactionExists.id} edited`}) : console.error({message: `Failed to edit Transaction ${transactionExists.id}`})
    } else {
      console.log({message: 'createTransaction beginning …'})
      const result = await createTransaction(transaction)
      // eslint-disable-next-line no-unused-expressions
      result ? console.log({message: `Transaction ${result.id} created`}) : console.error({message: `Failed to create new Transaction`})
    }
  }
  return transactionsArray
}

const changeTransactionCategory = async (id, categoryid) => {
  console.log({id, categoryid})
  const editedTransaction = await db.transaction.update({
    categoryid
  }, {
    where: {
      id
    }
  })
  console.log({editedTransaction})
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

module.exports = {
  getAllTransactions,
  getAllTransactionsPaginated,
  getTransactionsByAccountID,
  getTransactionByID,
  syncLedgerAccountId,
  editFullTransaction,
  createTransaction,
  createAddressTransactions,
  changeTransactionCategory,
  searchAllTransactions,
}
