module.exports = (sequelize, DataTypes) => {

    const xpub = sequelize.define('xpub', {
    
        name: {
            type: DataTypes.STRING
        },
        purpose: {
            type: DataTypes.STRING
        },
        addressIndex: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        changeIndex: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        }
    });

    xpub.associate = (models) => {
        xpub.belongsTo(models.account)
        xpub.hasMany(models.pubkey)
    }
    
    return xpub
};