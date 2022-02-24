module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      txid: {
        allowNull: true,
        type: Sequelize.STRING
      },
      network_fee: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      size: {
        allowNull: true,
        type: Sequelize.DECIMAL,
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      blockId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'blocks',
            // schema: 'schema'
          },
          key: 'id'
        },
        allowNull: true
      },
      categoryid: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'categories',
            // schema: 'schema'
          },
          key: 'id'
        },
        allowNull: true
      },
      transactiontypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'transactiontypes',
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
    await queryInterface.dropTable('transactions');
  }
}
