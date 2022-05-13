module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('transactions', [
      {
        id: 1,
        txid: '544570cc0170833b3fc5a5120f5e21bc1bfc88ae67af52963c8085234d3f6881',
        description: 'January wages',
        network_fee: 220,
        size: 140,
        blockId: 4,
        categoryid: 1,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        txid: 'd2b5380650bdebe9c762e613f1b922bef0b955059773b71970909a7dd7bcf39f',
        description: 'Move to cold storage',
        network_fee: 220,
        size: 140,
        blockId: 1,
        categoryid: 2,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        txid: '1da9981f9a9030a96efa564f36f7f17976e52550a0104653053d566f6a264ff0',
        description: 'Monthly donation',
        network_fee: 220,
        size: 140,
        blockId: 2,
        categoryid: 3,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        txid: '23740338e186c980d1b7102bcd7301a6072b3ec45c2006eac04fcf322f86c0c2',
        description: 'New Cold Card',
        network_fee: 220,
        size: 140,
        blockId: 3,
        categoryid: 4,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        txid: 'deffacbee72f139b291395fcfd5c6cbdbc92a91ed1fd95a77744aef259d056bf',
        description: 'Loan from Unchained',
        network_fee: 220,
        size: 140,
        blockId: 5,
        categoryid: 5,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        txid: 'c171fe5507aa7bf1c8d7242b6aa24ad8d69ef704d419e6cb9c7cef920f231d6b',
        description: 'Buy Antminer S19j Pro 104 TH',
        network_fee: 220,
        size: 140,
        blockId: 6,
        categoryid: 6,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        txid: '4057e9bb1d4581e0330085d6b61f607a9de29e75c6457646957942e18b7f6240',
        description: 'Wages',
        network_fee: 220,
        size: 140,
        blockId: 6,
        categoryid: 1,
        transactiontypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        txid: 'b6217732da1750fac2463ad7bc98bb47fc07776ee9aba69649c99d553863a83a',
        description: 'Pay Unchained Interest',
        network_fee: 220,
        size: 140,
        blockId: 7,
        categoryid: 1,
        transactiontypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('transactions', null, {})
  }
}
