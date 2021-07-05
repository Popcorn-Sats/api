const express = require('express');
const app = express();
const db = require('./models');
const cors = require('cors')
const PORT = process.env.PORT || 2121;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// API routes (TODO: create API file in /routes)
app.use('/accounts', require('./routes/accounts'));
app.use('/categories', require('./routes/categories'));
app.use('/transactions', require('./routes/transactions'));

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
});