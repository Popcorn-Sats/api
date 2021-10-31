module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      notes: {
        allowNull: true,
        type: Sequelize.STRING
      },
      birthday: {
          type: Sequelize.DATE
      },
      active: {
          allowNull: false,
          default: true,
          type: Sequelize.BOOLEAN
      },
      owned: {
          allowNull: false,
          default: true,
          type: Sequelize.BOOLEAN
      },
      accounttypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'accounttypes',
            // schema: 'schema'
          },
          key: 'id'
        },
        allowNull: false
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
    await queryInterface.dropTable('accounts');
  }
}
