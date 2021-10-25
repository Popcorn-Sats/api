module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactionledgers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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
      transactionId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'transactions',
            // schema: 'schema'
          },
          key: 'id'
        },
        allowNull: false
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
        allowNull: false
      },
      address: {
        allowNull: true,
        type: Sequelize.STRING
      },
      amount: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      // TODO: move address to its own table/model. Belongs to an account, hasmany UTXOs
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
    await queryInterface.dropTable('transactionledgers');
  }
}
