const express = require('express')

const app = express()
const cors = require('cors')
const db = require('./models')

const PORT = process.env.PORT || 2121
const getRoutes = require('./routes')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.use(getRoutes())

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Listening on port ${PORT}`)
    })
})