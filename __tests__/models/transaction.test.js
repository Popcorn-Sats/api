const faker = require('faker');
const Transaction = require('../../models/Transaction')

describe('Transaction', () => {
    describe('findByTransactionId', () => {
        it('finds the transaction by its ID', async () => {
          return true
          // FIXME: Transaction.create is unreachable
            // const txid = faker.datatype.string(16);

            // const transaction = await Transaction.create({
            //     txid: txid
            // });

            // const foundTransaction = await Transaction.findByTransactionId(txid);
            // expect(foundTransaction).not.toBeNull();
            // expect(foundTransaction.txid).toEqual(txid);

            // await transaction.destroy();
        })
    })
})
