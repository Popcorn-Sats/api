const { userTypes } = require('../constants/user');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {
        type: userTypes.OWNER,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: userTypes.ADMINISTRATOR,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: userTypes.AGENT,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
