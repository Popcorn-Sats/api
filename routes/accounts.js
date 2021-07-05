const express = require('express');
const router = express.Router();
const db = require('../models');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Get account list
router.get('/', (req, res) => 
    db.account.findAll({
        order: [
            ['id', 'ASC'],
        ],
        include: [db.xpub, db.accounttype]
    })
        .then(accounts => res.send(accounts))
        .catch(err => console.log(err)));

// Edit account
// router.put('/:accountId', (req, res, next) => {
router.put('/', (req, res, next) => {
    console.log(req.body)
    let { id, name, notes, birthday } = req.body;
    let accounttype = parseInt(req.body.accounttype)
    let errors = [];

    
    db.account.update(
        { 
            name, 
            notes, 
            birthday, 
            accounttype
        }, {
            where: {
                id: id
            }
        }
    )
    .then(account => res.json(account))
    .catch(err => console.log(err))
})   

// Add account
router.post('/add', (req, res, next) => {
    let { name, notes, birthday } = req.body;
    let accounttype = parseInt(req.body.accountType)
    let errors = [];

    // Validate fields
    if(!name || !birthday || !accounttype) {
        res.status(400).send()
    }

    // Check for  errors
    if(errors.length > 0) {
        res.send('add', {
            errors,
            name, 
            notes, 
            birthday, 
            accounttype
        })
    } else {
        // Insert into table
        db.account.create({
            name, 
            notes, 
            birthday, 
            accounttype
        })
        .then(account => res.json(account))
        .catch(err => console.log(err));
    }
});

// Search for accounts
router.get('/search', (req, res) => {
    const { term } = req.query;
    // How to make this case-agnostic without making everything lowercase?

    db.account.findAll({ where: Sequelize.or(
        { xpub: { [Op.like]: '%' + term + '%' } },
        { name: { [Op.like]: '%' + term + '%' } },
        { notes: { [Op.like]: '%' + term + '%' } },
        { accounttype: { [Op.like]: '%' + term + '%' } }
    )})
    .then(accounts => res.render('accounts', { accounts }))
    .catch(err => console.log(err));
});

module.exports = router;