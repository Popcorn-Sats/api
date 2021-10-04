/* eslint-disable camelcase */
/* eslint-disable no-console */
const db = require('../models')

// TODO: check if lodash has something for this; if not, move to utils
// Helper function to return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
  let objects = [];
  for (const i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] === 'object') {
          objects = objects.concat(getObjects(obj[i], key, val));    
      } else 
      // if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
      // this seems to be duplicating the object ...
      if (i === key && obj[i] === val || i === key && val === '') { //
          objects.push(obj);
      } else if (obj[i] === val && key === ''){
          // only add if the object is not already in the array
          if (objects.lastIndexOf(obj) === -1){
              objects.push(obj);
          }
      }
  }
  return objects;
}

module.exports.checkAndCreateAccount = async (name) => {
  let accountMatch
  let accountId
  await db.account.findAll({
    order: [
        ['id', 'ASC'],
    ],
  })
  .then(accounts => {
      accountMatch = getObjects(accounts, '', name)
      if (accountMatch[0]) {
          accountId = accountMatch[0].id
      }
      else {
          // Insert into table
          db.account.create({
              name
          })
          .then(
              account => {
                  // console.log(account)
                  accountId = account.id
              }
          )
          .catch(err => console.log(err));
      }
  })
  .catch(err => console.log(err));
  return accountId
}