module.exports = (sequelize, DataTypes) => {
    
    const AccountType = sequelize.define('accounttype', {
        name: {
            type: DataTypes.STRING
        }
    })

    AccountType.associate = (models) => {
        AccountType.hasMany(models.account, {
            
        })
    }

    return AccountType

}