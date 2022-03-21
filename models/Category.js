const Sequelize = require('sequelize')
const { Model } = require('sequelize')
const { paginate } = require('../utils/paginate')

const { Op } = Sequelize

module.exports = (sequelize) => {

  class Category extends Model {

    static findAllCategoriesPaginated(page, perPage, sort = 'name', order = 'ASC', filter) {
      let keys; let values
      let where = {}
      if (filter && Object.keys(filter).length > 0 && filter.constructor === Object) {
        keys = Object.keys(filter) // TODO: Fine for this one, but need to loop through all keys
        values = Object.values(filter)
        const filterName = filter ? keys[0] : null
        const filterValue = filter ? values[0] : null
        where = {
          [Op.or]: [
            {
              [filterName]: {
                [Op.iLike]: `%${filterValue}%`
              }
            }
          ]
        }
      }
      return this.findAndCountAll({
        where,
        order: [
            [sort, order],
        ],
        ...paginate({ page, perPage })
      })
    }

    static associate(models) {
      Category.hasMany(models.transaction,  {
        foreignKey: 'categoryid'
      });
    }
  }

  Category.init({
    // Note: primary key needed in model for Sequelize to merge properly on 'hasMany'
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
  }, {
    sequelize,
    modelName: 'category',
  })

  return Category

}