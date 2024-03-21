const FormData = require('form-data');
const axios = require('axios');
const Car = require('../models/Car');

require('dotenv').config();


exports.register2 = async (req, res) => {
    console.log(req.body);
    const { license_plate, color } = req.body;
    const licensePlate = license_plate.toUpperCase();

    try {
        const existingCar = await Car.findOne({ licensePlate: licensePlate });

        if (existingCar) {
            console.log(`${new Date().toLocaleString()} - Error: Car registration - License Plate: ${licensePlate} already registered.`);
            return res.status(400).json({ message: 'Car with this license plate is already registered.' });
        }

        const newCar = new Car({
            licensePlate: licensePlate,
            color: color,
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


exports.register = async (req, res) => {
    const { license_plate, color } = req.body;
    const licensePlate = license_plate.toUpperCase();

    try {
        const existingCar = await Car.findOne({ licensePlate: licensePlate });

        if (existingCar) {
            console.log(`${new Date().toLocaleString()} - Error: Car registration - License Plate: ${licensePlate} already registered.`);
            return res.status(400).json({ message: 'Car with this license plate is already registered.' });
        }

        if (req.file) {
            const image = req.file;

            const formData = new FormData();
            formData.append('photo', image.buffer, {
                contentType: image.mimetype,
                filename: image.originalname
            });

            const formHeaders = formData.getHeaders();

            try {
                console.log('Sending image to server:', `http://${process.env.IMAGES_SERVER_URL}/upload`);

                const imageResponse = await axios.post(`http://${process.env.IMAGES_SERVER_URL}/upload`, formData, {
                    headers: {
                        ...formHeaders,
                    }
                });

                const imagePath = imageResponse.data.path;

                const newCar = new Car({
                    licensePlate: licensePlate,
                    color: color,
                    imagePath: imageResponse.data.imageUrl,
                    entryTime: new Date()
                });

                await newCar.save();

                console.log(`${new Date().toLocaleString()} - Request: Car registration - License Plate: ${licensePlate}.`);
                res.status(201).json({ message: 'Car successfully registered.', car: newCar });

            } catch (err) {
                console.error(`${new Date().toLocaleString()} - Error while uploading the image: ${err}`);
                res.status(500).json({ message: 'Error while uploading the image.' });
            }
        } else {
            console.error(`${new Date().toLocaleString()} - Error: No file uploaded`);
            res.status(400).json({ message: 'No file uploaded.' });
        }

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
                car.imagePath = `http://${process.env.IMAGES_SERVER_URL}/images/${car.imagePath.split('/').pop()}`;
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
    if (!req.body.license_plate) {
        return res.status(400).json({ message: 'license_plate is required.' });
    }

    const { license_plate, color, new_license_plate } = req.body;
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

        if (req.file) {
            const image = req.file;

            const formData = new FormData();
            formData.append('photo', image.buffer, {
                contentType: image.mimetype,
                filename: image.originalname
            });

            const formHeaders = formData.getHeaders();

            try {
                const imageResponse = await axios.post(`http://${process.env.IMAGES_SERVER_URL}/upload`, formData, {
                    headers: {
                        ...formHeaders,
                    }
                });

                car.imagePath = imageResponse.data.imageUrl;
            } catch (err) {
                console.error(`${new Date().toLocaleString()} - Error while uploading the image: ${err}`);
                return res.status(500).json({ message: 'Error while uploading the image.' });
            }
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
    const licensePlate = req.params.licensePlate.toUpperCase();

    try {
        const car = await Car.findOneAndDelete({ licensePlate });

        if (!car) {
            console.log(`${new Date().toLocaleString()} - Error: Car not found - License Plate: ${licensePlate}`);
            return res.status(404).json({ message: 'Car not found.' });
        } else {
            const filename = car.imagePath.split('/').pop();

            await axios.delete(`http://${process.env.IMAGES_SERVER_URL}/delete/${filename}`);

            console.log(`${new Date().toLocaleString()} - Request: Withdraw car - License Plate: ${licensePlate}`);
            res.status(200).json({ message: 'Car withdrawn successfully.' });
        }
    } catch (err) {
        console.error(`${new Date().toLocaleString()} - Error withdrawing car: ${err}`);
        res.status(500).json({ message: 'Error withdrawing car.' });
    }
};
