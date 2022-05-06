const { userTypes } = require('../constants/user');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: userTypes.OWNER,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: userTypes.ADMINISTRATOR,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: userTypes.AGENT,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
