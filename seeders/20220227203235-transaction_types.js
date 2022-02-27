module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('transactiontypes', [
      {
        id: 1,
        type: "Debit",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        type: "Credit",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('transactiontypes', null, {});
  }
};
