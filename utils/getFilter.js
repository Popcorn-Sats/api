const Sequelize = require('sequelize')

const { Op } = Sequelize

const getFilter = filter => {
  /* const filterKeys = Object.keys(filter)
  const filterValues = Object.values(filter)
  const filterObject = {}
  for (let i = 0; i < filterKeys.length; i += 1) {
    filterObject[filterKeys[i]] = filterValues[i]
  }
  return filterObject */

  let keys; let values
  let where = {}
  if (filter && Object.keys(filter).length > 0 && filter.constructor === Object) {
    keys = Object.keys(filter) // TODO: Fine for this one, but need to loop through all keys
    values = Object.values(filter)
    const filterName = filter ? keys[0] : null
    const filterValue = filter ? values[0] : null
    where = {
      [Op.or]: [
        {
          [filterName]: {
            [Op.iLike]: `%${filterValue}%`
          }
        }
      ]
    }
  }
  return where
}

module.exports = {
  getFilter,
}