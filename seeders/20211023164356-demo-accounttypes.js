const { accountTypes } = require('../constants/account/index')

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('accounttypes', [
      {
        id: accountTypes.FEES.key,
        name: accountTypes.FEES.name,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: accountTypes.WALLET.key,
        name: accountTypes.WALLET.name,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: accountTypes.VAULT.key,
        name: accountTypes.VAULT.name,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: accountTypes.EXPENSE.key,
        name: accountTypes.EXPENSE.name,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: accountTypes.INCOME.key,
        name: accountTypes.INCOME.name,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: "Debt",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: "Fixed Assets",
        createdAt: new Date(),
        updatedAt: new Date()
      }
      ], {});
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('accounttypes', null, {});
  }
};
