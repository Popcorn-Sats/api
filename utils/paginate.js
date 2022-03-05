const paginate = ({ page, perPage }) => {
  const offset = (page - 1) * perPage;
  const limit = perPage;

  return {
    offset,
    limit,
  };
};

module.exports = {
  paginate,
}