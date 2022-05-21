module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('accounts', 'reportaccountsubtypeId', {
      type: Sequelize.INTEGER,
      references: {
        model: {
          tableName: 'reportaccountsubtypes',
          // schema: 'schema'
        },
        key: 'id'
      },
      allowNull: true,
    })
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => queryInterface.removeColumn('accounts', 'reportaccountsubtypeId')
};
