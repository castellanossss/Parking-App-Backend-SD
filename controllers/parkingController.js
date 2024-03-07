const axios = require('axios');
const Car = require('../models/Car');

require('dotenv').config();


exports.register = async (req, res) => {
    const { license_plate, color } = req.body;
    const licensePlate = license_plate.toUpperCase();

    try {
        const existingCar = await Car.findOne({ licensePlate: licensePlate });

        if (existingCar) {
            console.log(`${new Date().toLocaleString()} - Error: Car registration - License Plate: ${licensePlate} already registered.`);
            return res.status(400).json({ message: 'Car with this license plate is already registered.' });
        }

        const image = req.file;

        const formData = new FormData();
        formData.append('image', image.buffer, image.originalname);

        const imageResponse = await axios.post(`http://${process.env.IMAGES_SERVER_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        const imagePath = imageResponse.data.path;

        const newCar = new Car({
            licensePlate: licensePlate,
            color: color,
            imagePath: imagePath,
            entryTime: new Date()
        });

        await newCar.save();

        console.log(`${new Date().toLocaleString()} - Request: Car registration - License Plate: ${licensePlate}.`);
        res.status(201).json({ message: 'Car successfully registered.', car: newCar });
    } catch (err) {
        console.error(`${new Date().toLocaleString()} - Error registering car: ${err}`);
        res.status(500).json({ message: 'Error registering car.' });
    }
};


exports.list = async (req, res) => {
    try {
        console.log(`${new Date().toLocaleString()} - Request: List cars.`);

        const cars = await Car.find();

        if (cars.length === 0) {
            console.log(`${new Date().toLocaleString()} - No cars registered.`);
            return res.status(200).json([]);
        }

        const updatedCars = cars.map(car => {
            if (car.imagePath) {
                car.imagePath = `${process.env.IMAGES_SERVER_URL}/images/${car.imagePath}`;
            }
            return car;
        });

        res.status(200).json(updatedCars);
    } catch (err) {
        console.error(`${new Date().toLocaleString()} - Error listing cars: ${err}`);
        res.status(500).json({ message: 'Error listing cars.' });
    }
};


exports.getCarByLicensePlate = async (req, res) => {
    const licensePlate = req.params.licensePlate.toUpperCase();

    try {
        const car = await Car.findOne({ licensePlate: licensePlate });

        if (!car) {
            console.log(`${new Date().toLocaleString()} - Error: Car not found - License Plate: ${licensePlate}`);
            return res.status(404).json({ message: 'Car not found.' });
        }

        if (car.imagePath) {
            car.imagePath = `${process.env.IMAGES_SERVER_URL}/${car.imagePath}`;
        }

        console.log(`${new Date().toLocaleString()} - Request: Get car by license plate - License Plate: ${licensePlate}`);
        res.status(200).json(car);
    } catch (err) {
        console.log(`${new Date().toLocaleString()} - Error: Get car by license plate - License Plate: ${licensePlate} - ${err}`);
        res.status(500).json({ message: 'Error getting car by license plate.' });
    }
};


exports.update = async (req, res) => {
    const { license_plate, color, new_license_plate, imagePath } = req.body;
    const licensePlate = license_plate.toUpperCase();
    const newLicensePlate = new_license_plate ? new_license_plate.toUpperCase() : licensePlate;

    try {
        const car = await Car.findOne({ licensePlate: licensePlate });

        if (!car) {
            console.log(`${new Date().toLocaleString()} - Error: Car not found - License Plate: ${licensePlate}.`);
            return res.status(404).json({ message: 'Car not found.' });
        }

        car.color = color || car.color;
        car.licensePlate = newLicensePlate;

        if (imagePath) {
            car.imagePath = imagePath;
        }

        await car.save();

        console.log(`${new Date().toLocaleString()} - Request: Update car - License Plate: ${licensePlate}.`);
        res.status(200).json({ message: 'Car updated successfully.', car });
    } catch (err) {
        console.error(`${new Date().toLocaleString()} - Error updating car: ${err}`);
        res.status(500).json({ message: 'Error updating car.' });
    }
};


exports.withdraw = async (req, res) => {
    const licensePlate = req.body.license_plate.toUpperCase();

    try {
        const car = await Car.findOneAndDelete({ licensePlate: licensePlate });

        if (car) {
            console.log(`${new Date().toLocaleString()} - Request: Withdraw car - License Plate: ${licensePlate}.`);
            res.status(200).json({ message: 'Car withdrawn successfully.' });
        } else {
            console.log(`${new Date().toLocaleString()} - Error: Car not found - License Plate: ${licensePlate}.`);
            res.status(404).json({ message: 'Car not found.' });
        }
    } catch (err) {
        console.error(`${new Date().toLocaleString()} - Error withdrawing car: ${err}`);
        res.status(500).json({ message: 'Error withdrawing car.' });
    }
};
