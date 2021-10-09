# Development Style Guide

Routes should be one line and route to a controller, e.g.

`.get('/', ctrl.getCategories)`

Controllers should only be concerned with HTTP requests and responses, e.g.

```
const getCategories = async (req, res) => {
  const categories = await getAllCategories()
  res.json(categories)
}
```

Controllers should request services, where the bulk of the logic lives, e.g.

```
module.exports.getAllCategories = async () => {
  const categories = await db.category.findAll({
    attributes: {
        include: [
            [
                Sequelize.literal(`(
                    SELECT SUM(balance_change)
                    FROM transactions AS transaction
                    WHERE
                        transaction.categoryId = category.id
                )`),
                'balance'
            ]
        ]
    },
    order: [
        ['name', 'ASC'],
    ]
  })
  if (!categories) {
    return { failed: true, message: "No categories were found" }
  }
  return categories
}
```