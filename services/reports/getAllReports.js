const getAllReports = async (userId, year) => {
  const currentYear = new Date().getFullYear().toString()
  const isCurrentYear = year === currentYear

  const reports = []

  if (isCurrentYear) {
    const report = {
      Year: currentYear,
      BalanceSheet: true,
      IncomeStatement: true,
      CashFlow: true,
      Finalized: false,
    }
    reports.push(report)
  } else {
    for (let i = parseInt(year, 10); i <= parseInt(currentYear, 10); i += 1) {
      const report = {
        Year: i.toString(),
        BalanceSheet: true,
        IncomeStatement: true,
        CashFlow: true,
        Finalized: i !== parseInt(currentYear, 10),
      }
      reports.push(report)
    }
  }

  return reports
  
}

module.exports = {
  getAllReports
}
