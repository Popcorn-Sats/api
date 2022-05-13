module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('transactionledgers', [
      {
        amount: 7800,
        accountId: 5,
        transactionId: 1,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 220,
        accountId: 2,
        transactionId: 1,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 7580,
        accountId: 1,
        transactionId: 1,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 6000,
        accountId: 1,
        transactionId: 2,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 220,
        accountId: 2,
        transactionId: 2,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 5780,
        accountId: 6,
        transactionId: 2,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 580,
        accountId: 1,
        transactionId: 3,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 220,
        accountId: 2,
        transactionId: 3,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 360,
        accountId: 3,
        transactionId: 3,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 1000,
        accountId: 1,
        transactionId: 4,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 220,
        accountId: 2,
        transactionId: 4,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 880,
        accountId: 4,
        transactionId: 4,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 1000220,
        accountId: 7,
        transactionId: 5,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 220,
        accountId: 2,
        transactionId: 5,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 1000000,
        accountId: 1,
        transactionId: 5,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 1000000,
        accountId: 1,
        transactionId: 6,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 220,
        accountId: 2,
        transactionId: 6,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 999780,
        accountId: 10,
        transactionId: 6,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 7800,
        accountId: 5,
        transactionId: 7,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 220,
        accountId: 2,
        transactionId: 7,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 7580,
        accountId: 1,
        transactionId: 7,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 3580,
        accountId: 1,
        transactionId: 8,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 220,
        accountId: 2,
        transactionId: 8,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: 3360,
        accountId: 7,
        transactionId: 8,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('transactionledgers', null, {})
  }
}
