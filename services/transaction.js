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

const getTransactionType = async (ledgers) => {
  const creditsOwned = []
  const debitsOwned = []
  for (let i = 0; i < ledgers.length; i += 1) {
    const account = await db.account.findOne({
      where: {
        id: ledgers[i].accountId
      }
    })
    if (!account && ledgers[i].transactiontypeId === 1) {
      debitsOwned.push(false)
    }
    else if (account && ledgers[i].transactiontypeId === 1 && account?.id !== 0) {
      debitsOwned.push(account?.owned)
    } else if (!account && ledgers[i].transactiontypeId === 2) {
      creditsOwned.push(false)
    } else if (account && ledgers[i].transactiontypeId === 2 && account?.id !== 0) {
      creditsOwned.push(account?.owned)
    }
  }
  if (!_.includes(creditsOwned, false) && !_.includes(debitsOwned, false)) {
    return "transfer"
  }
  if (_.includes(creditsOwned, true) && !_.includes(debitsOwned, true)) {
    return "deposit"
  }
  if (_.includes(creditsOwned, true) && _.includes(creditsOwned, false) && _.includes(debitsOwned, true) && _.includes(debitsOwned, false)) {
    return "coinjoin"
  }
  if (_.includes(creditsOwned, false) && !_.includes(debitsOwned, false)) {
    return "withdrawal"
  }
  return null
}

const formatTransactionsObject = async (rawTransactions, accountId) => {
  if (!rawTransactions) {
    return { failed: true, message: "No transactions were passed to format" }
  }
  const transactions = []
  const {length} = rawTransactions
  const orderedTransactions = _.orderBy(rawTransactions, 'block.height', 'asc')
  let runningBalance = 0
  for (let i = 0; i < length; i += 1) {
    const transaction = {}
    const ledgers = []
    orderedTransactions[i].transactionledgers.forEach(ledger => {
      const thisLedger = {}
      thisLedger.accountId = ledger.accountId
      thisLedger.amount = ledger.amount
      thisLedger.transactiontypeId = ledger.transactiontypeId
      ledgers.push(thisLedger)
    })
    if (accountId) {
      const accountInteger = parseInt(accountId, 10)
      const debits = _.sum(_.map(_.map(_.filter(_.filter(ledgers, {accountId: accountInteger}), {transactiontypeId: 1}), 'amount'), _.parseInt))
      const credits = _.sum(_.map(_.map(_.filter(_.filter(ledgers, {accountId: accountInteger}), {transactiontypeId: 2}), 'amount'), _.parseInt))
      transaction.balance_change = credits - debits
    } else  {
      const accounts = await db.account.findAll({
        where: {
          owned: true
        }
      })
      const ownedAccounts = _.map(accounts, 'id')
      const debits = _.sum(_.map(_.map(_.filter(_.filter(ledgers, (v) => _.includes(ownedAccounts, v.accountId)), {transactiontypeId: 1}), 'amount'), _.parseInt))
      const credits = _.sum(_.map(_.map(_.filter(_.filter(ledgers, (v) => _.includes(ownedAccounts, v.accountId)), {transactiontypeId: 2}), 'amount'), _.parseInt))
      transaction.balance_change = credits - debits
    }
    
    transaction.id = orderedTransactions[i].id
    transaction.txid = orderedTransactions[i].txid
    transaction.network_fee = orderedTransactions[i].network_fee
    transaction.size = orderedTransactions[i].size
    transaction.description = orderedTransactions[i].description
    transaction.block = orderedTransactions[i].block
    transaction.category = orderedTransactions[i].category
    transaction.transactiontype = await getTransactionType(ledgers)
    transaction.transactionledgers = orderedTransactions[i].transactionledgers
    transaction.runningBalance = runningBalance + transaction.balance_change
    runningBalance = transaction.runningBalance
    transactions.push(transaction)
  }
  return transactions.reverse()
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
  // console.log(transactions)
  return transactions
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
  const transactions = await formatTransactionsObject(rawTransactions)
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
  if (!rawTransactions) {
    return { failed: true, message: "Transactions for account not found" }
  }
  const transactions = await formatTransactionsObject(rawTransactions, accountId)
  return transactions
}

const getTransactionsByCategoryID = async (categoryId) => {
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
  const transactions = await formatTransactionsObject(rawTransactions)
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
  getTransactionLedgersByAccountID,
  getTransactionsByAccountID,
  getTransactionsByCategoryID,
  getTransactionByID,
  syncLedgerAccountId,
  editFullTransaction,
  createTransaction,
  createAddressTransactions,
  changeTransactionCategory,
  searchAllTransactions,
}
