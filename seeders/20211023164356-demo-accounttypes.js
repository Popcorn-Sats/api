module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('accounttypes', [
      {
        id: 0,
        name: "Fees",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 1,
        name: "Wallet",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: "Vault",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: "Expense",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: "Income",
        createdAt: new Date(),
        updatedAt: new Date()
      }
      ], {});
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('accounttypes', null, {});
  }
};
