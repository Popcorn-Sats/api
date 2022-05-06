module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Wages',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Transfer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Donation',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bitcoin Hardware',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {})
  }
}
