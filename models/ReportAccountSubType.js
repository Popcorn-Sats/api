const Sequelize = require('sequelize')
const { Model } = require('sequelize')

module.exports = (sequelize) => {
  class ReportAccountSubType extends Model {
    static associate(models) {
      ReportAccountSubType.hasMany(models.account, {
      })
    }
  };
  ReportAccountSubType.init({
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'reportaccountsubtype',
  });
  return ReportAccountSubType;
};