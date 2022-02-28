const { transactionTypes } = require('../constants/transaction');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('transactiontypes', [
      {
        id: transactionTypes.DEBIT.key,
        type: transactionTypes.DEBIT.name,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: transactionTypes.CREDIT.key,
        type: transactionTypes.CREDIT.name,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('transactiontypes', null, {});
  }
};
