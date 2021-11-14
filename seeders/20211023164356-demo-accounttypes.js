module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('accounttypes', [
      {
        name: "Fees",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Wallet",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Vault",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Expense",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
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
