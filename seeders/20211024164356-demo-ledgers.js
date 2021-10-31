const { date } = require("faker");

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('transactionledgers', [
      {
        accountId: 6,
        transactionId: 1,
        transactiontypeId: 2,
        address: null,
        amount: 42098,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 1,
        transactionId: 1,
        transactiontypeId: 1,
        address: null,
        amount: 42098,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 7,
        transactionId: 2,
        transactiontypeId: 2,
        address: null,
        amount: 980765,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 1,
        transactionId: 2,
        transactiontypeId: 1,
        address: null,
        amount: 980765,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 1,
        transactionId: 3,
        transactiontypeId: 2,
        address: null,
        amount: 8932345,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 8,
        transactionId: 3,
        transactiontypeId: 1,
        address: null,
        amount: 8932345,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 12,
        transactionId: 38,
        transactiontypeId: 2,
        address: null,
        amount: 458792345,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 10,
        transactionId: 38,
        transactiontypeId: 1,
        address: null,
        amount: 458792345,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: null,
        transactionId: 5,
        transactiontypeId: 2,
        address: 'bc1ab23cd45',
        amount: 920,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 1,
        transactionId: 5,
        transactiontypeId: 1,
        address: null,
        amount: 920,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 10,
        transactionId: 40,
        transactiontypeId: 2,
        address: null,
        amount: 1080339,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 12,
        transactionId: 40,
        transactiontypeId: 1,
        address: null,
        amount: 1080339,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      ], {});
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('transactionledgers', null, {});
  }
};
