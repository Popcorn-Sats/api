const faker = require('faker');
const _ = require('lodash')
const db = require('../../models')
const { checkAndCreateAccount } = require('../../services/accounts/checkAndCreateAccount')

describe('Account Model', () => {
    describe('findAllAccounts', () => {
        it('returns all accounts', async () => {
            const name = faker.name.firstName()
            const name2 = faker.name.firstName()
            await checkAndCreateAccount(name)
            await checkAndCreateAccount(name2)

            const allAccounts = await db.account.findAllAccounts();
            expect(allAccounts).not.toBeNull();
            expect(_.map(allAccounts, 'name')).toContain(name);
            expect(_.map(allAccounts, 'name')).toContain(name2);
        })
    })
    describe('findAccountByName', () => {
      it('returns account object for name', async () => {
          const name = faker.name.firstName()
          const newAccount = await checkAndCreateAccount(name)

          const foundAccount = await db.account.findAccountByName(name);
          expect(foundAccount).not.toBeNull();
          expect(foundAccount.id).toEqual(newAccount);
          expect(foundAccount.name).toEqual(name);
      })
    })
    describe('findAccountById', () => {
      it('returns account object for id', async () => {
          const name = faker.name.firstName()
          const newAccountId = await checkAndCreateAccount(name)

          const foundAccount = await db.account.findAccountById(newAccountId);
          expect(foundAccount).not.toBeNull();
          expect(foundAccount.id).toEqual(newAccountId);
          expect(foundAccount.name).toEqual(name);
      })
    })
})