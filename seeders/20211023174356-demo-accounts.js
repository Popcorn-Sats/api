module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('accounts', [
      {
        id: 0,
        name: "Network Fees",
        notes: null,
        birthday: "2009-01-03",
        active: true,
        owned: false,
        accounttypeId: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 1,
        name: "Wasabi",
        notes: "Used between exchanges and cold storage",
        birthday: "2020-10-01",
        active: true,
        owned: true,
        accounttypeId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: "Trezor",
        notes: "Old wallet - continue transfers",
        birthday: "2020-10-01",
        active: true,
        owned: true,
        accounttypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: "Cold Card",
        notes: "Current cold storage",
        birthday: "2020-10-01",
        active: true,
        owned: true,
        accounttypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: "Cash App",
        notes: null,
        birthday: "2020-10-01",
        active: true,
        owned: true,
        accounttypeId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: "Cold Card Business Account",
        notes: "Current business account",
        birthday: "2020-10-01",
        active: true,
        owned: true,
        accounttypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: "Wasabi Team",
        notes: null,
        birthday: "2020-10-01",
        active: true,
        owned: false,
        accounttypeId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        name: "Excellion",
        notes: null,
        birthday: "2020-10-01",
        active: true,
        owned: false,
        accounttypeId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        name: "Al",
        notes: "Lacrosse gear",
        birthday: "2020-10-01",
        active: true,
        owned: false,
        accounttypeId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 9,
        name: "It's a me, Mario",
        notes: null,
        birthday: "2020-10-01",
        active: true,
        owned: false,
        accounttypeId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 10,
        name: "Ryan",
        notes: null,
        birthday: "2020-10-01",
        active: false,
        owned: false,
        accounttypeId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 11,
        name: "Test new wallet",
        notes: "Used between exchanges and cold storage",
        birthday: "2020-10-01",
        active: true,
        owned: false,
        accounttypeId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 12,
        name: "Cotton Candy",
        notes: null,
        birthday: "2020-10-01",
        active: true,
        owned: false,
        accounttypeId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      ], {});
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('accounts', null, {});
  }
};
