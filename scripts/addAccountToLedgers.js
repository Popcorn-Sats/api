/* eslint-disable no-console */
const {syncLedgerAccountId} = require('../services/transaction')

const accountId = process.argv[2];

(async() => {
  console.log({accountId});
  const result = await syncLedgerAccountId(accountId)
  // console.log({result});
})();
