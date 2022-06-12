const { getAllReports } = require('../services/reports/getAllReports')
const { getBalanceSheet } = require('../services/reports/getBalanceSheet')

const getReports = async (req, res) => {
  const { userId, year, page, perPage, /* sort, order, filter */ } = req.query
  // const parsedFilter = filter ? JSON.parse(filter) : null;
  const reports = await getAllReports(userId, year)
    .catch(err => res.status(500).send(err))
  res.header('Content-Range', `bytes : ${(page - 1) * perPage}-${page * perPage - 1}/${reports.count}`)
  return res.json(reports)
}

const getSingleBalanceSheet = async (req, res) => {
  const { userId, year } = req.query
  const reports = await getBalanceSheet(userId, year)
    .catch(err => res.status(500).send(err))
  return res.json(reports)
}

module.exports = {
  getReports,
  getSingleBalanceSheet,
}
