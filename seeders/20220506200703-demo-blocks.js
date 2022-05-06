module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('blocks', [
      {
        id: 1,
        height: 578995,
        timestamp: 1559517233,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        height: 576300,
        timestamp: 1558009732,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        height: 573676,
        timestamp: 1556489077,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        height: 556888,
        timestamp: 1546548700,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('blocks', null, {})
  }
}
