const express = require('express');
const router = express.Router();
const db = require('../models');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Get all transactions
router.get('/', (req, res) => 
    db.transaction.findAll({
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
        .then(transactions => res.json(transactions))
        .catch(err => console.log(err)));

// Get transactions for :accountId
router.get('/:accountId', (req, res, next) => {
    let accountId = req.params.accountId;
    db.transaction.findAll(
        {
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
                    include: [db.account],
                    //where: {
                    //    accountId: accountId
                    //}
                    // This only brings over the single ledger.
                    // Wider scope needed
                    // Consider running a small script 
                    // like this to find the txids. Then grab those txns?
                }
            ]
        }, {
            where: {
                include: [
                    {
                        model: db.transactionledger,
                        where: {
                            accountId: accountId
                        }
                    }
                ]
            }
        }
    )
    .then(transactions => res.json(transactions))
    .catch(err => console.log(err))
})

// Edit transaction
router.put('/', (req, res, next) => {
    console.log(req.body)
    let { id, date, description, category, payee, block_height, txid, balance_change, account, address, fee, size } = req.body;
    let errors = [];

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
                id: id
            }
        }
    )
    .then(transaction => res.json(transaction).send())
    .catch(err => console.log(err))
})   

// Add transaction
router.post('/add', async (req, res, next) => {
    console.log(req.body);
    
    let { blockHeight, txid, balance_change, address, network_fee, size, description, sender, category, recipient } = req.body;
    let errors = [];
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
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(getObjects(obj[i], key, val));    
            } else 
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            //this seems to be duplicating the object ...
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
                        //console.log(category)
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
                        //console.log(account)
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
                        //console.log(account)
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
                    //console.log(block)
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
});


// Search for transactions
router.get('/search', (req, res) => {
    const { term } = req.query;
    // How to make this case-agnostic without making everything lowercase?

    db.transaction.findAll({ where: Sequelize.or(
        { category: { [Op.like]: '%' + term + '%' } },
        { description: { [Op.like]: '%' + term + '%' } },
        { payee: { [Op.like]: '%' + term + '%' } },
        { block_height: { [Op.like]: '%' + term + '%' } },
        { txid: { [Op.like]: '%' + term + '%' } },
        { account: { [Op.like]: '%' + term + '%' } },
        { address: { [Op.like]: '%' + term + '%' } }
    )})
    .then(transactions => res.render('transactions', { transactions }))
    .catch(err => console.log(err));
});

module.exports = router;