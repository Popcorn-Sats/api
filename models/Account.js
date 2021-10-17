module.exports = (sequelize, DataTypes) => {

    const Account = sequelize.define('account', {
        
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        notes: {
            type: DataTypes.STRING
        },
        birthday: {
            type: DataTypes.DATE
        },
        active: {
            type: DataTypes.INTEGER
        },
        owned: {
            type: DataTypes.BOOLEAN
        },
    });
    Account.associate = (models) => {
        Account.hasOne(models.xpub, {
            onDelete: "cascade"
        })
        Account.belongsTo(models.accounttype, {
            
        })
        Account.hasMany(models.transactionledger)
    }
    return Account
}