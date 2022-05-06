module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('accounts', [
      {
        name: 'Electrum test account',
        notes: 'This is a demo account',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: true,
        accounttypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Network Fees',
        notes: 'This is a demo account',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: false,
        accounttypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Human Rights Foundation',
        notes: 'This is a demo account',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: false,
        accounttypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Coinkite',
        notes: 'This is a demo account',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: false,
        accounttypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('accounts', null, {});
  }
}
