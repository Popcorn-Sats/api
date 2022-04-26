// const { getAllReportsPaginated } = require('../services/reports')

const getAllReportsPaginated = async (page, perPage, sort, order, filter) => {
  console.log({page, perPage, sort, order, filter})
  return {reports: 'success'}
}

const getReports = async (req, res) => {
  const { page, perPage, sort, order, filter } = req.query
  const parsedFilter = filter ? JSON.parse(filter) : null;
  const reports = await getAllReportsPaginated(page, perPage, sort, order, parsedFilter)
  .catch(err => res.status(500).send(err))
  res.header('Content-Range', `bytes : ${(page - 1) * perPage}-${page * perPage - 1}/${reports.count}`)
  return res.json(reports.reports)
}

const getSingleBalanceSheet = async (req, res) => {
  const { page, perPage, sort, order, filter } = req.query
  const parsedFilter = filter ? JSON.parse(filter) : null;
  const reports = await getAllReportsPaginated(page, perPage, sort, order, parsedFilter)
  .catch(err => res.status(500).send(err))
  res.header('Content-Range', `bytes : ${(page - 1) * perPage}-${page * perPage - 1}/${reports.count}`)
  return res.json(reports.reports)
}

module.exports = {
  getReports,
  getSingleBalanceSheet,
}
