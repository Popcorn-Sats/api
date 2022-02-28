const faker = require('faker');
const db = require('../../models')

describe('Transaction', () => {
    describe('findByTransactionId', () => {
        it('finds the transaction by its ID', async () => {
            const txid = faker.datatype.string(16);

            const transaction = await db.transaction.create({
                txid
            });

            const foundTransaction = await db.transaction.findByTransactionId(txid);
            expect(foundTransaction).not.toBeNull();
            expect(foundTransaction.txid).toEqual(txid);

            await transaction.destroy();
        })
    })
})
