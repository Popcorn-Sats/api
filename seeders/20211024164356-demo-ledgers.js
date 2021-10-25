module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('transactionledgers', [
      {
        accountId: 6,
        transactionId: 1,
        transactiontypeId: 2,
        address: null
      },
      {
        accountId: 1,
        transactionId: 1,
        transactiontypeId: 1,
        address: null
      },
      {
        accountId: 7,
        transactionId: 2,
        transactiontypeId: 2,
        address: null
      },
      {
        accountId: 1,
        transactionId: 2,
        transactiontypeId: 1,
        address: null
      },
      {
        accountId: 1,
        transactionId: 3,
        transactiontypeId: 2,
        address: null
      },
      {
        accountId: 8,
        transactionId: 3,
        transactiontypeId: 1,
        address: null
      },
      {
        accountId: 25,
        transactionId: 38,
        transactiontypeId: 2,
        address: null
      },
      {
        accountId: 22,
        transactionId: 38,
        transactiontypeId: 1,
        address: null
      },
      {
        accountId: null,
        transactionId: 5,
        transactiontypeId: 2,
        address: null
      },
      {
        accountId: 1,
        transactionId: 5,
        transactiontypeId: 1,
        address: null
      },
      {
        accountId: 25,
        transactionId: 40,
        transactiontypeId: 2,
        address: null
      },
      {
        accountId: 22,
        transactionId: 40,
        transactiontypeId: 1,
        address: null
      },
      ], {});
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('transactionledgers', null, {});
  }
};
