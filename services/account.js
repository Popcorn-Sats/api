/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const config = require('../config/config.json')
const {getAddressFromXpub} = require('./bitcoin')
const {getAddress} = require('./electrum')
const {checkAndCreateAddress} = require('./address')
const {createAddressTransactions} = require('./transaction')

const {Op} = Sequelize

const getAllAccounts = async () => {
  const errors = []
  const accounts = await db.account.findAll({
    order: [
        ['id', 'ASC'],
    ],
    include: [db.xpub, db.accounttype]
  })
  .catch(err => {
    errors.push(err)
    return errors
  })
  if (!accounts) {
    return { failed: true, message: "No accounts were found" }
  }
  return accounts
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
  return account
}

const editAccountById = async (account) => {
  const { id, name, notes, birthday } = account
  const accounttype = parseInt(account.accounttype, 10)
  const errors = []
  const editedAccount = await db.account.update(
    { 
        name, 
        notes, 
        birthday, 
        accounttype
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
  return editedAccount
}

const syncAccount = async (accountId, startingIndex, publicKey, purpose) => {
  const addresses = []
  let i = startingIndex
  let j = startingIndex
  let addressIndex = startingIndex

  console.log({i, j, addressIndex, gap: config.BITCOIN.GAPLIMIT})

  const syncNewAddresses = async () => {
    console.log("syncing addresses")
    const batch = addressIndex + config.BITCOIN.GAPLIMIT
    console.log({batch})

    console.log({accountId})

    for(i; i < batch; i += 1) {
      const rawAddress = await getAddressFromXpub(publicKey, i, purpose)
      await checkAndCreateAddress(rawAddress.address, accountId, i, 0)
      addresses.push(rawAddress.address)
    }

    for(j; j < addresses.length; j += 1) {
      // FIXME: this should be asynchronous / promise.all in the background after finding addressfromxpub
      // FIXME: should batch calls to electrum on initial sync
      // TODO: take optional address count flag for initial sync
      console.log("Here we are")
      const address = addresses[j]
      console.log({address})
      const transactionsObj = await getAddress(address)
      console.log({transactionsObj})
      if (transactionsObj.chain_stats.tx_count > 0 || transactionsObj.mempool_stats.tx_count > 0) {
        // TODO: create transaction + transactionLedgers + utxos, etc.
        console.log({message: "Here we go", address})
        // FIXME: JSON circular structure error on transactions service. Move back to this
        try {
          const transactions = await createAddressTransactions(address) // await promise.all
          console.log(transactions)
        } catch (e) {
          console.error(e)
          return({"Error": e})
        }
        addressIndex = j
        await db.xpub.update({
          addressIndex
        }, {
          where: {
            accountId
          }
        })
      }
      console.log({address: addresses[j], tx_count: transactionsObj.chain_stats.tx_count})
    }
    return addresses
  }

  while (i - addressIndex < config.BITCOIN.GAPLIMIT) {
    await syncNewAddresses()
  }
}

const createAccount = async (account) => {
  const { name, notes, birthday, active, owned, publicKey, purpose } = account
  const accounttypeId = parseInt(account.accounttypeId, 10)
  const errors = []

  // Validate required fields
  if(!name || !accounttypeId) {
    return { failed: true, message: "Missing required field(s)" }
  }

  const accountExists = await db.account.findOne({
    where: {
      name
    }
  })

  if (accountExists) {
    console.log({failed: true, message: "An account with this name already exists"})
    return({failed: true, message: "An account with this name already exists"})
  }

  const xpubExists = await db.xpub.findOne({
    where: {
      name: publicKey
    }
  })

  if(xpubExists) {
    console.log({failed: true, message: "Public key already associated with another account"})
    return({failed: true, message: "Public key already associated with another account"})
  }

  console.log("New pubkey, proceeding …")

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

  await syncAccount(newAccount.dataValues.id, newAccount.xpub.dataValues.addressIndex, publicKey, purpose)

  return newAccount
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

module.exports = {
  getAllAccounts,
  getAccountById,
  editAccountById,
  syncAccount,
  createAccount,
  checkAndCreateAccount,
  searchAllAccounts
}
