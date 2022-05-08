module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('accounts', [
      {
        id: 1,
        name: 'Electrum test account',
        notes: 'Main hot wallet',
        birthday: new Date(),
        userId: 1,
        reportAccountType: 'currentAsset',
        active: true,
        owned: true,
        accounttypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Network Fees',
        notes: 'Miner transaction fees',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: false,
        accounttypeId: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Human Rights Foundation',
        notes: 'Charitable donations',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: false,
        accounttypeId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Coinkite',
        notes: 'Hardware and security',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: false,
        accounttypeId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Mr Boss',
        notes: 'Monthly salary',
        birthday: new Date(),
        userId: 1,
        active: true,
        owned: false,
        accounttypeId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: 'Cold Storage',
        notes: 'Multisig vault',
        birthday: new Date(),
        userId: 1,
        reportAccountType: 'currentAsset',
        active: true,
        owned: true,
        accounttypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        name: 'Unchained Capital Loan',
        notes: 'Loan to buy miners',
        birthday: new Date(),
        userId: 1,
        reportAccountType: 'currentLiability',
        active: true,
        owned: true,
        accounttypeId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('accounts', null, {})
  }
}
