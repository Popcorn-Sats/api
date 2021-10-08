/* eslint-disable no-console */
const express = require('express')

const ctrl = require('../controllers/category')

const router = express.Router()

const Sequelize = require('sequelize')
const db = require('../models')

const {Op} = Sequelize

router
  .get('/', ctrl.getCategories)

// Edit category
// router.put('/:accountId', (req, res, next) => {
router.put('/', (req, res, next) => {
    console.log(req.body)
    const { id, name } = req.body;
    const errors = [];

    
    db.category.update(
        { 
            name
        }, {
            where: {
                id
            }
        }
    )
    .then(category => res.json(category))
    .catch(err => console.log(err))
})   

// Add category
router.post('/add', (req, res, next) => {
    const { name } = req.body;
    const errors = [];

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