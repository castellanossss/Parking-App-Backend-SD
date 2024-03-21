const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://mongodb-container:27017/parkingServiceBD')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require('./routes/routes');
app.use('/cars', routes);

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/checkHealth', (req, res) => {
    const randomDelay = Math.random() * 5000; 
    const timeout = 3000;

    if (randomDelay > timeout) {
        console.log(`Timeout: No response sent. Random delay was ${randomDelay}ms`);
        setTimeout(() => {
            res.status(504).send('Timeout');
            console.log(`Timeout response sent after ${randomDelay}ms`);
        }, randomDelay);
    } else {
        setTimeout(() => {
            res.status(200).send('OK');
            console.log(`Response sent after ${randomDelay}ms`);
        }, randomDelay);
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});
