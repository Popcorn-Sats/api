/* eslint-disable no-restricted-syntax */
// TODO: check if lodash has something for this
// Helper function to return an array of objects according to key, value, or key and value matching
const getObjects = (obj, key, val) => {
  let objects = [];
  for (const i in obj) {
      // eslint-disable-next-line no-continue, no-prototype-builtins
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

module.exports = {
  getObjects
}