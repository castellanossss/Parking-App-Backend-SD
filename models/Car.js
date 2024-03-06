const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    licensePlate: String,
    color: String,
    imagePath: String,
    entryTime: { type: Date, default: Date.now }
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;