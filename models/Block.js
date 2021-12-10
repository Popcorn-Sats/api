module.exports = (sequelize, DataTypes) => {

    const Block = sequelize.define('block', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        height: {
            type: DataTypes.INTEGER,
            unique: true
        },
        timestamp: {
            type: DataTypes.STRING
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