const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/UserRoute');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
