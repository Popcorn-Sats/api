/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const config = require('../config/config.json')
const {getAddressFromXpub} = require('./bitcoin')
const {getAddress} = require('./electrum')
const {checkAndCreateAddress} = require('./address')

const {Op} = Sequelize

module.exports.getAllAccounts = async () => {
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

module.exports.getAccountById = async (id) => {
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

module.exports.editAccountById = async (account) => {
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

module.exports.createAccount = async (account) => { // TODO: move logic to checkAndCreateAccount, change route
  const { name, notes, birthday, active, owned, publicKey, purpose } = account
  const accounttypeId = parseInt(account.accounttypeId, 10)
  const errors = []

  // Validate required fields
  if(!name || !birthday || !accounttypeId) {
    return { failed: true, message: "Missing required field(s)" }
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

  const addresses = []

  // TODO: Move to new service `synchronizeAccount`?

  let i = newAccount.xpub.dataValues.addressIndex
  let j = newAccount.xpub.dataValues.addressIndex
  let {addressIndex} = newAccount.xpub.dataValues

  console.log({i, j, addressIndex, gap: config.BITCOIN.GAPLIMIT})

  const syncNewAddresses = async () => {
    console.log("syncing addresses")
    const batch = addressIndex + config.BITCOIN.GAPLIMIT
    console.log({batch})

    console.log("AccountID: ", newAccount.dataValues.id)

    for(i; i < batch; i += 1) {
      const rawAddress = await getAddressFromXpub(publicKey, i, purpose)
      await checkAndCreateAddress(rawAddress.address, newAccount.dataValues.id, i, 0)
      addresses.push(rawAddress.address)
    }

    for(j; j < addresses.length; j += 1) {
      // FIXME: this should be asynchronous / promise.all in the background after finding addressfromxpub
      // FIXME: should batch calls to electrum on initial sync
      // TODO: take optional address count flag for initial sync
      const transactionsObj = await getAddress(addresses[j])
      if (transactionsObj.chain_stats.tx_count > 0 || transactionsObj.mempool_stats.tx_count > 0) {
        // TODO: create transaction + transactionLedgers + utxos, etc.
        addressIndex = j
        await db.xpub.update({
          addressIndex
        }, {
          where: {
            accountId: newAccount.dataValues.id
          }
        })
      }
      console.log({address: addresses[j], tx_count: transactionsObj.chain_stats.tx_count})
    }
  }

  while (i - addressIndex < config.BITCOIN.GAPLIMIT) {
    await syncNewAddresses()
  }

  return newAccount
}

module.exports.searchAllAccounts = async (term) => {
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

module.exports.checkAndCreateAccount = async (name) => {
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