const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://mongodb:27017/parkingServiceBD')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

console.log(`${new Date().toLocaleString()} - Application starting...`);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require('./routes/routes');
app.use('/cars', routes);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`${new Date().toLocaleString()} - Server listening on port ${PORT}.`);
});
