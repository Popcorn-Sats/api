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
        accounttypeId: 0,
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
        accounttypeId: 3,
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
        accounttypeId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mr Boss',
        notes: 'This is a demo account',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: false,
        accounttypeId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cold Storage',
        notes: 'This is a demo account',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: false,
        accounttypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('accounts', null, {})
  }
}
