module.exports = (sequelize, DataTypes) => {
    
    const Category = sequelize.define('category', {
        // Note: primary key needed in model for Sequelize to merge properly on 'hasMany'
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    })

    Category.associate = models => {

        Category.hasMany(models.transaction,  {
            foreignKey: 'categoryid'
          });
    
    }

    return Category
}