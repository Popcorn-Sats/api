module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('xpubs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      purpose: {
          type: Sequelize.STRING
      },
      addressIndex: {
          type: Sequelize.INTEGER
      },
      changeIndex: {
        type: Sequelize.INTEGER
      },
      accountId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'accounts',
            // schema: 'schema'
          },
          key: 'id'
        },
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('xpubs');
  }
}
