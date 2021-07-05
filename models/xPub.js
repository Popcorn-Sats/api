module.exports = (sequelize, DataTypes) => {

    const xpub = sequelize.define('xpub', {
    
        name: {
            type: DataTypes.STRING
        }
    });

    xpub.associate = (models) => {
        xpub.belongsTo(models.account)
        xpub.hasMany(models.pubkey)
    }
    
    return xpub
};