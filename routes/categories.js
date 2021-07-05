const express = require('express');
const router = express.Router();
const db = require('../models');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Get category list
router.get('/', (req, res) => 
    db.category.findAll({
        attributes: {
            include: [
                [
                    // Something weird going on below where Sequelize makes transaction.categoryId all lowercase. Had to change the column name ...
                    Sequelize.literal(`(
                        SELECT SUM(balance_change)
                        FROM transactions AS transaction
                        WHERE
                            transaction.categoryId = category.id
                    )`),
                    'balance'
                ]
            ]
        },
        order: [
            ['name', 'ASC'],
        ]
    })
        .then(categories => res.json(categories))
        .catch(err => console.log(err)));

// Edit category
// router.put('/:accountId', (req, res, next) => {
router.put('/', (req, res, next) => {
    console.log(req.body)
    let { id, name } = req.body;
    let errors = [];

    
    db.category.update(
        { 
            name
        }, {
            where: {
                id: id
            }
        }
    )
    .then(category => res.json(category))
    .catch(err => console.log(err))
})   

// Add category
router.post('/add', (req, res, next) => {
    let { name } = req.body;
    let errors = [];

    // Validate fields
    if(!name) {
        res.status(400).send()
    }

    // Check for  errors
    if(errors.length > 0) {
        res.send('add', {
            errors,
            name
        })
    } else {
        // Insert into table
        db.category.create({
            name
        })
        .then(category => res.json(category))
        .catch(err => console.log(err));
    }
});

// Search for categories
router.get('/search', (req, res) => {
    const { term } = req.query;
    // How to make this case-agnostic without making everything lowercase?

    db.category.findAll({ where: Sequelize.or(
        { name: { [Op.like]: '%' + term + '%' } }
    )})
    .then(categories => res.render('categories', { categories }))
    .catch(err => console.log(err));
});

module.exports = router;