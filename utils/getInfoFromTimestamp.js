const getYearFromUnixTimestamp = (unixTimestamp) => new Date(unixTimestamp * 1000).getFullYear()

module.exports = {
  getYearFromUnixTimestamp,
}
