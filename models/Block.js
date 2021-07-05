module.exports = (sequelize, DataTypes) => {

    const Block = sequelize.define('block', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        height: {
            type: DataTypes.INTEGER
        },
        date: {
            type: DataTypes.DATE
        }
    })

    Block.associate = models => {

        Block.hasMany(models.transaction);

    }

    return Block
    
}