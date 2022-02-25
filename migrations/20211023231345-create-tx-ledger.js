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
      utxoId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'utxos',
          },
          key: 'id'
        },
        allowNull: true
      },
      addressId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'addresses',
          },
          key: 'id'
        },
        allowNull: true
      },
      amount: {
        allowNull: false,
        type: Sequelize.BIGINT
      },
      currency: {
        allowNull: true,
        type: Sequelize.STRING
      },
      fiatAmount: {
        allowNull: true,
        type: Sequelize.BIGINT
      },
      fiatCurrency: {
        allowNull: true,
        type: Sequelize.STRING
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
    await queryInterface.dropTable('transactionledgers');
  }
}
