const Sequelize = require('sequelize')
const { Model } = require('sequelize')
const { paginate } = require('../utils/paginate')

module.exports = (sequelize) => {

  class Category extends Model {

    static findAllCategoriesPaginated(page, perPage, sort = 'name', order = 'ASC') {
      return this.findAndCountAll({
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