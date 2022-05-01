const _ = require('lodash')
const { reportAccountTypes } = require('../constants/account')

const ACCOUNT_TYPES = _.values(reportAccountTypes)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('accounts', 'reportAccountType', {
      type: Sequelize.ENUM(...ACCOUNT_TYPES),
      allowNull: true,
    })
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => queryInterface.removeColumn('accounts', 'reportAccountType')
}
