/* eslint-disable camelcase */
/* eslint-disable no-console */
const Sequelize = require('sequelize')
const db = require('../models')
const { getTransactionsByAccountID, getAllTransactions } = require('../services/transaction')

const {Op} = Sequelize

const getTransactions = async (req, res) => {
  const transactions = await getAllTransactions()
  res.json(transactions)
  // .catch(err => res(err))
}

const getTransactionsForAccount = async (req, res) => {
    const {accountId} = req.params
    const transactions = await getTransactionsByAccountID(accountId)
    // const status = transactions.failed ? 400 : 200
    res.json(transactions)
}

const editTransaction = async (req, res) => {
    console.log(req.body)
    const { id, date, description, category, payee, block_height, txid, balance_change, account, address, fee, size } = req.body;
    const errors = [];

    db.transaction.update(
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
    .then(transaction => res.json(transaction).send())
    .catch(err => {
      errors.push(err)
      res(errors)
      console.log(err)
    })
}

const addTransaction = async (req, res) => {
    console.log(req.body);
    
    const { blockHeight, txid, balance_change, address, network_fee, size, description, sender, category, recipient } = req.body;
    const errors = [];
    let categoryid;
    let blockId;
    let senderId;
    let recipientId;

    // Validate required fields
    if(!balance_change || !sender || !recipient) {
        res.status(400).send()
    }

    // Helper function to return an array of objects according to key, value, or key and value matching
    function getObjects(obj, key, val) {
        const objects = [];
        for (let i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(getObjects(obj[i], key, val));    
            } else 
            // if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            // this seems to be duplicating the object ...
            if (i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if (obj[i] == val && key == ''){
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1){
                    objects.push(obj);
                }
            }
        }
        return objects;
    }

    // Check if category exists, create if not
    let categoryMatch
    let categoryIndex
    if (category) {
        await db.category.findAll({
            order: [
                ['id', 'ASC'],
            ],
        })
        .then(categories => {
            categoryIndex = categories[categories.length -1].dataValues.id + 1 // Need to get the next index manually as it's defined in the model TODO: helper function to DRY
            categoryMatch = getObjects(categories, '', category)
            if (categoryMatch[0]) {
                categoryid = categoryMatch[0].id // TODO: Fix duplicate object bug in getObjects script above
            }
            else {
                // Insert into table
                db.category.create({
                    id: categoryIndex,
                    name: category
                })
                .then(
                    category => {
                        // console.log(category)
                        categoryid = category[id]
                    }
                )
                .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
    }

    // Check if sender exists, create if not
    let accountMatch
    if (sender) {
        await db.account.findAll({
            order: [
                ['id', 'ASC'],
            ],
        })
        .then(accounts => {
            accountMatch = getObjects(accounts, '', sender)
            if (accountMatch[0]) {
                senderId = accountMatch[0].id
            }
            else {
                // Insert into table
                db.account.create({
                    name: sender
                })
                .then(
                    account => {
                        // console.log(account)
                        senderId = account[id]
                    }
                )
                .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
    }

    // Check if recipient exists, create if not
    let payeeMatch
    if (recipient) {
        await db.account.findAll({
            order: [
                ['id', 'ASC'],
            ],
        })
        .then(accounts => {
            payeeMatch = getObjects(accounts, '', recipient)
            if (payeeMatch[0]) {
                recipientId = payeeMatch[0].id
            }
            else {
                // Insert into table
                db.account.create({
                    name: recipient
                })
                .then(
                    account => {
                        // console.log(account)
                        recipientId = account[id]
                    }
                )
                .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err))
        
    }

    // Check if block exists, create if not
    let blockMatch
    let blockIndex
    if (blockHeight) {
        await db.block.findAll({
            order: [
                ['id', 'ASC'],
            ],
        })
        .then(blocks => {
            blockIndex = blocks[blocks.length -1].dataValues.id + 1
            blockMatch = getObjects(blocks, '', blockHeight)
        })
        if (blockMatch[0]) {
            blockId = blockMatch[0].id
        }
        else {
            // Insert into table
            db.block.create({
                id: blockIndex,
                height: blockHeight
            })
            .then(
                block => {
                    // console.log(block)
                    blockId = block[id]
                }
            )
            .catch(err => console.log(err));
        }
    }

    // Check for  errors
    if(errors.length > 0) {
        res.send('add', {
            balance_change, 
            sender, 
            recipient
        })
    } else {
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
        await db.transaction.create({
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
        .then(transaction => res.json(transaction).send())
        .catch(err => console.log(err));
    }
}

// Search transactions
const searchTransactions = async (req, res) => {

  const { term } = req.query;
  // How to make this case-agnostic without making everything lowercase?
  db.transaction.findAll({ where: Sequelize.or(
      { category: { [Op.like]: `%${  term  }%` } },
      { description: { [Op.like]: `%${  term  }%` } },
      { payee: { [Op.like]: `%${  term  }%` } },
      { block_height: { [Op.like]: `%${  term  }%` } },
      { txid: { [Op.like]: `%${  term  }%` } },
      { account: { [Op.like]: `%${  term  }%` } },
      { address: { [Op.like]: `%${  term  }%` } }
  )})
  .then(transactions => res.render('transactions', { transactions }))
  .catch(err => console.log(err));
}

module.exports = {
  getTransactions,
  getTransactionsForAccount,
  editTransaction,
  addTransaction,
  searchTransactions
}