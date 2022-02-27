const faker = require('faker')
const db = require('../../../models')
const {checkAndCreateAccount} = require('../../../services/accounts/checkAndCreateAccount')

describe('Accounts', () => {
    describe('checkAndCreateAccount', () => {
        it('creates an account when the name is unique', async () => {
            const name = faker.name.firstName()
            const accountId = await checkAndCreateAccount(name)
            expect(accountId).toBeDefined()

            const accountObj = await db.account.findAccountById(accountId)
            expect(accountObj.name).toEqual(name)
        })
        it('returns the existing account ID when the name exists', async () => {
            const name = faker.name.firstName()
            const accountId = await checkAndCreateAccount(name)
            const accountId2 = await checkAndCreateAccount(name)
            expect(accountId).toEqual(accountId2)
        })
    })
})