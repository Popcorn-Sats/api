module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('utxos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      utxo: {
        allowNull: false,
        type: Sequelize.STRING
      },
      transactionledgerId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'transactionledgers',
            // schema: 'schema'
          },
          key: 'id'
        },
        allowNull: false
      },
      addressId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'addresses',
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
    await queryInterface.dropTable('utxos');
  }
}
