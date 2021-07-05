module.exports = (sequelize, DataTypes) => {

    const TransactionType = sequelize.define('transactiontype', {
        type: DataTypes.STRING
    })

    TransactionType.associate = models => {

        TransactionType.hasMany(models.transaction);

        TransactionType.hasMany(models.transactionledger)
    
    }

    return TransactionType
    
}