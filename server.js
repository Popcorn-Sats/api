require('module-alias/register')
const express = require('express')

const app = express()
const cors = require('cors')
const config = require('./config/config.json')
const db = require('./models')

const PORT = process.env.PORT || 2121
const getRoutes = require('./routes')

const corsOptions = {
  origin: config.APPLICATION.hostname.admin,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization'],
  exposedHeaders: ['Content-Range'],
}

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors(corsOptions))

app.use(getRoutes())

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Listening on port ${PORT}`)
    })
})