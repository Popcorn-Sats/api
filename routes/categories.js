/* eslint-disable no-console */
const express = require('express')

const ctrl = require('../controllers/category')

const router = express.Router()

const Sequelize = require('sequelize')
const db = require('../models')

const {Op} = Sequelize

router
  .get('/', ctrl.getCategories)
  .put('/', ctrl.editCategory)
  .post('/add', ctrl.addCategory)

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