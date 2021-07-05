module.exports = (sequelize, DataTypes) => {

    const PubKey = sequelize.define('pubkey', {
        
        pubkey: {
            type: DataTypes.STRING
        }
    })

    PubKey.associate = (models) => {
        PubKey.belongsTo(models.xpub)
    }

    return PubKey

}