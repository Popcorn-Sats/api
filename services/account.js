/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const _ = require('lodash')
const { generateMultisigFromPublicKeys, MAINNET, P2SH, multisigAddress } = require('unchained-bitcoin')
const db = require('../models')
const config = require('../config/config.json')
const {getAddressFromXpub} = require('./bitcoin')
const {getAddress, initiate} = require('./electrum')
const {checkAndCreateAddress} = require('./address')
const {createAddressTransactions} = require('./transaction')
const { getYearFromUnixTimestamp } = require('../utils/getInfoFromTimestamp')

const {Op} = Sequelize

const getAccountBalance = async (accountId, year = null) => {
  const ledgers = await db.transactionledger.getTransactionLedgersByAccountID(accountId)
  .catch(err => {
    console.log(err)
  })
  const credits = []
  const debits = []
  ledgers.forEach(ledger => {
    const txYear = getYearFromUnixTimestamp(ledger.transaction.block.timestamp).toString()
    if (!ledger.transactiontypeId) {
      console.log({failed: true, message: `Ledger ID ${ledger.id} does not have a transaction type`})
      return({failed: true, message: `Ledger ID ${ledger.id} does not have a transaction type`})
    }
    if (year && year !== txYear) {
      return
    }
    if (ledger.transactiontypeId === 2) {
      credits.push(parseInt(ledger.amount, 10))
    }
    else if (ledger.transactiontypeId === 1) {
      debits.push(parseInt(ledger.amount, 10))
    }
  });
  const balance = _.sum(credits) - _.sum(debits)
  return balance
}

const getAllAccounts = async (userId = null, year = null) => {
  const errors = []
  const accountsArray = []
  const accounts = userId ? await db.account.findAllAccountsByUserId(userId) : await db.account.findAllAccounts() // TODO: restrict to userId accounts after testing
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!accounts) {
    return { failed: true, message: "No accounts were found" }
  }

  const {length} = accounts
  for (let i = 0; i < length; i += 1) {
    const account = {}
    account.id = accounts[i].id
    account.name = accounts[i].name
    account.notes = accounts[i].notes
    account.active = accounts[i].active
    account.owned = accounts[i].owned
    account.accounttype = accounts[i].accounttype
    account.reportAccountType = accounts[i].reportAccountType
    account.reportAccountSubType = accounts[i].reportaccountsubtype.name
    account.balance = await getAccountBalance(accounts[i].id, year || null)
    accountsArray.push(account)
  }
  return accountsArray
}

const getAllAccountsPaginated = async (page, perPage, sort, order, filter) => {
  const errors = []
  const accountsArray = []
  const accounts = await db.account.findAllAccountsPaginated(page, perPage, sort, order, filter)
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!accounts) {
    return { failed: true, message: "No accounts were found" }
  }

  const { rows } = accounts
  const {length} = rows

  // TODO: DRY this up as formatAccountsObject
  for (let i = 0; i < length; i += 1) {
    const account = {}
    account.id = rows[i].id
    account.name = rows[i].name
    account.notes = rows[i].notes
    account.active = rows[i].active
    account.owned = rows[i].owned
    account.accounttype = rows[i].accounttype
    account.balance = await getAccountBalance(rows[i].id) // FIXME: Add to model
    accountsArray.push(account)
  }
  return { accounts: accountsArray, count: accounts.count }
}

const getNetPosition = async () => {
  const errors = []
  const accountsArray = []
  const accounts = await db.account.findAll({
    where: {
      owned: true
    }
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!accounts) {
    return { failed: true, message: "No accounts were found" }
  }

  const {length} = accounts
  for (let i = 0; i < length; i += 1) {
    const account = {}
    account.balance = await getAccountBalance(accounts[i].id)
    accountsArray.push(account)
  }
  const balance = _.sum(_.map(accountsArray, 'balance'))
  return balance
}

const getAccountById = async (id) => {
  const errors = []
  const account = await db.account.findOne({
    where: {
      id
    },
    include: [db.xpub, db.accounttype]
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!account) {
    return { failed: true, message: "No accounts were found" }
  }
  const returnAccount = {}
  returnAccount.id = account.id
  returnAccount.name = account.name
  returnAccount.notes = account.notes
  returnAccount.birthday = account.birthday
  returnAccount.active = account.active
  returnAccount.owned = account.owned
  returnAccount.xpub = account.xpub
  returnAccount.accounttype = account.accounttype
  returnAccount.balance = await getAccountBalance(account.id)
  return returnAccount
}

const editAccountById = async (account, id) => {
  console.log({account, id})
  const { name, notes, birthday, active, owned } = account
  const accounttypeId = parseInt(account.accounttype.id, 10)
  const errors = []
  let editedAccount = await db.account.update(
    { 
        name, 
        notes, 
        birthday, 
        active, 
        owned, 
        accounttypeId
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

  if(!editedAccount) {
    return { failed: true, message: "Something went wrong???category wasn't edited", errors }
  }

  editedAccount = await getAccountById(id)

  return editedAccount
}

const deleteAccountById = async (id) => {
  // TODO: decide on data cascade / nulling
  const errors = []
  const deletedAccount = await db.account.destroy({
    where: {
      id
    },
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!deletedAccount) {
    return { failed: true, message: "No account was found" }
  }
  console.log("Account deleted!")
  return deletedAccount
}

const syncAccount = async (accountId, startingIndex, startingChangeIndex, publicKey, purpose) => {
  // TODO: take optional address count flag for initial sync
  initiate()
  const addresses = []
  const changeAddresses = []
  let i = startingIndex
  let addressIndex = startingIndex
  let k = startingChangeIndex
  let changeIndex = startingChangeIndex

  console.log({i, addressIndex, gap: config.BITCOIN.GAPLIMIT})

  const syncNewAddresses = async () => {
    console.log("syncing addresses")
    const batch = addressIndex + config.BITCOIN.GAPLIMIT
    const changeBatch = changeIndex + config.BITCOIN.GAPLIMIT
    console.log({batch, changeBatch})

    for(i; i < batch; i += 1) {
      const rawAddress = await getAddressFromXpub(publicKey, i, purpose, 0)
      await checkAndCreateAddress(rawAddress.address, accountId, i, 0)
      addresses.push(rawAddress.address)
    }

    for(k; k < changeBatch; k += 1) {
      const rawAddress = await getAddressFromXpub(publicKey, k, purpose, 1)
      await checkAndCreateAddress(rawAddress.address, accountId, k, 1)
      addresses.push(rawAddress.address)
      changeAddresses.push(rawAddress.address)
    }

    console.log({addresses})

    const checkForTransactions = async transactionsObj => {
      const { address } = transactionsObj
      if (transactionsObj.chain_stats.tx_count > 0 || transactionsObj.mempool_stats.tx_count > 0) {
        console.log({message: "Checking transactions for address", address})
        const savedAddress = await db.address.findOne({
          where: {
            address
          }
        })
        try {
          const transactions = await createAddressTransactions(address, accountId) // await promise.all
          // eslint-disable-next-line no-unused-expressions
          transactions ? console.log({message: `Created address transactions`, accountId, address}) : null
        } catch (e) {
          console.error(e)
          return({"Error": e})
        }
        if (changeAddresses.indexOf(address) !== -1 && savedAddress.txIndex + 1 > changeIndex) {
          changeIndex = savedAddress.txIndex + 1
          await db.xpub.update({
            changeIndex
          }, {
            where: {
              accountId
            }
          })
        } else if (savedAddress.txIndex + 1 > addressIndex) {
          addressIndex = savedAddress.txIndex + 1
          await db.xpub.update({
            addressIndex
          }, {
            where: {
              accountId
            }
          })
        }
        console.log({message: "Created transactions for address"})
        console.log({address, tx_count: transactionsObj.chain_stats.tx_count})
        return "Success"
      }
      console.log({message: "No transactions for address"})
      return "No transactions"
    }

    const transactionsObjList = await Promise.all(addresses.map(address => getAddress(address)))

    console.log({message: `Found ${transactionsObjList.length} transactions for this address batch`})

    for(let j = 0; j < transactionsObjList.length; j += 1) {
      await checkForTransactions(transactionsObjList[j])
    }

    return addresses
  }

  while (i - addressIndex < config.BITCOIN.GAPLIMIT || k - changeIndex < config.BITCOIN.GAPLIMIT) {
    await syncNewAddresses()
  }
  return({failed: false, message: "Account synced!"})
}

const createAccount = async (account) => {
  const { name, notes, birthday, active, owned, publicKey, purpose, address } = account
  const accounttypeId = parseInt(account.accounttypeId, 10)
  const errors = []

  // Validate required fields
  if(!name || !accounttypeId) {
    return { failed: true, message: "Missing required field(s)" }
  }

  const accountExists = await db.account.findAccountByName(name)

  if (accountExists) {
    console.log({failed: true, message: "An account with this name already exists"})
    return({failed: true, message: "An account with this name already exists"})
  }

  if (publicKey) {
    const xpubExists = await db.xpub.findOne({
      where: {
        name: publicKey
      }
    })
  
    if(xpubExists) {
      console.log({failed: true, message: "Public key already associated with another account"})
      return({failed: true, message: "Public key already associated with another account"})
    }
  
    console.log("New public key, proceeding ???")
  }

  const newAccount = await db.account.create({
    name, 
    notes, 
    birthday, 
    accounttypeId,
    active: active || true,
    owned: owned || true,
    xpub: {name: publicKey, purpose}
  }, {
    include: [
        {
            model: db.xpub
        }
    ]
  })
  .catch(err => {
    errors.push(err)
    console.log(errors)
    return errors
  })

  console.log("Created new account")

  if (address) { // FIXME: should call checkAndCreateAddress? Check if it updates accountId
    const addressExists = await db.address.findOne({
      where: {
        address
      }
    })

    if (addressExists) {
      await db.address.update(
        {
          accountId: newAccount.dataValues.id
        }, {
          where: {
            address
          }
        }
      )
    } else {
      await db.address.create({
        address,
        accountId: newAccount.dataValues.id
      })
    }
    await createAddressTransactions(address, newAccount.dataValues.id)
  }

  if (publicKey) {
    console.log("Syncing new account from public key")
    await syncAccount(newAccount.dataValues.id, newAccount.xpub.dataValues.addressIndex, newAccount.xpub.dataValues.changeIndex, publicKey, purpose)
  }

  return newAccount
}

const createMultiSig = async ({ name, notes, birthday, active, owned, publicKeys, purpose, accounttypeId }) => {
  // TODO: Stub method, implement
  const accounttypeIdInt = parseInt(accounttypeId, 10)
  const errors = []

  // Validate required fields
  if(!name || !publicKeys || !accounttypeId) {
    return { failed: true, message: "Missing required field(s)" }
  }

  const accountExists = await db.account.findAccountByName(name)

  if (accountExists) {
    console.log({failed: true, message: "An account with this name already exists"})
    return({failed: true, message: "An account with this name already exists"})
  }

  const multisigObj = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, ...publicKeys)
  const address1 = multisigAddress(multisigObj)
}

const scanAccount = async (id) => {
  const accountExists = await db.account.findAccountById(id)

  if (!accountExists) {
    console.log({failed: true, message: "That account does not exist"})
    return({failed: true, message: "That account does not exist"})
  }

  const xpubExists = await db.xpub.findOne({
    where: {
      accountId: id
    }
  })

  if(!xpubExists) {
    console.log({failed: true, message: "This account does not have an associated public key"})
    return({failed: true, message: "This account does not have an associated public key"})
  }

  const {addressIndex, changeIndex, name, purpose} = xpubExists

  console.log({addressIndex, name, purpose})

  const result = await syncAccount(id, addressIndex, changeIndex, name, purpose)

  // TODO: check for new transactions on all existing addresses

  return result
}

const scanAddress = async (addressId) => {
  initiate()
  const savedAddress = await db.address.findOne({
    where: {
      id: addressId
    }
  })

  if (!savedAddress) {
    return {failed: true, message: "This address does not exist"}
  }

  const transactionsObj = await getAddress(savedAddress.address)

  const { address, accountId } = savedAddress

  if (transactionsObj.chain_stats.tx_count > 0 || transactionsObj.mempool_stats.tx_count > 0) {
    console.log({message: "Checking transactions for address", address})
    try {
      const transactions = await createAddressTransactions(address, accountId)
      // eslint-disable-next-line no-unused-expressions
      transactions ? console.log({message: `Created address transactions`, accountId, address}) : null
      // console.log(transactions)
    } catch (e) {
      console.error(e)
      return({"Error": e})
    }
    console.log({message: "Created transactions for address"})
    console.log({address, tx_count: transactionsObj.chain_stats.tx_count})
    return "Success"
  }
  console.log({message: "No transactions for address"})
  return "No transactions"
}

const searchAllAccounts = async (term) => {
  const errors = []
  const result = await db.account.findAll({ where: {[Op.or]: [
      { '$xpub.name$': { [Op.iLike]: `%${  term  }%` } },
      { name: { [Op.iLike]: `%${  term  }%` } },
      { notes: { [Op.iLike]: `%${  term  }%` } }
  ]},
include: [
  { model: db.xpub },
]})
  .catch(err => {
    errors.push(err)
    return errors
  })
  return(result)
}

module.exports = {
  getAllAccounts,
  getAllAccountsPaginated,
  getNetPosition,
  getAccountById,
  editAccountById,
  deleteAccountById,
  syncAccount,
  createAccount,
  createMultiSig,
  scanAccount,
  scanAddress,
  searchAllAccounts
}
