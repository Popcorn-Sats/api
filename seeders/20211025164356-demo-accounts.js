module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('accounts', [
      {
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
        name: "Cash App Zane",
        notes: null,
        birthday: "2020-10-01",
        active: true,
        owned: true,
        accounttypeId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
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
        name: "Ryder",
        notes: null,
        birthday: "2020-10-01",
        active: false,
        owned: false,
        accounttypeId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
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
        name: "Ryder the second",
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
    await queryInterface.bulkDelete('transactionledgers', null, {});
  }
};
