const fs = require('fs');

let cars = [];

exports.register = (req, res) => {
    const { license_plate, color } = req.body;
    const licensePlate = license_plate.toUpperCase();
    const imagePath = req.file ? req.file.filename : '';
    const entryTime = req.body.entryTime || new Date();

    // Buscar si ya existe un carro con la misma placa
    const existingCarIndex = cars.findIndex(car => car.licensePlate === licensePlate);

    if (existingCarIndex !== -1) {
        console.log(`${new Date().toLocaleString()} - Error: Car registration - License Plate: ${licensePlate} already registered.`);
        return res.status(400).json({ message: 'Car with this license plate is already registered.' });
    }

    // Si no existe, registrar el nuevo carro
    const newCar = {
        licensePlate: licensePlate,
        color: color,
        imagePath: imagePath,
        entryTime: entryTime // Guardar la fecha de registro
    };
    cars.push(newCar);

    console.log(`${new Date().toLocaleString()} - Request: Car registration - License Plate: ${licensePlate}.`);
    res.status(201).json({ message: 'Car successfully registered.', car: newCar });
};

exports.list = (req, res) => {
    console.log(`${new Date().toLocaleString()} - Request: List cars.`);

    if (cars.length === 0) {
        console.log(`${new Date().toLocaleString()} - No cars registered.`);
        return res.status(404).json({ message: 'No cars registered.' });
    }

    // Devolver los coches registrados
    res.status(200).json(cars);
};

exports.getCarByLicensePlate = (req, res) => {
    const licensePlate = req.params.licensePlate.toUpperCase();
    const car = cars.find(c => c.licensePlate === licensePlate);

    if (!car) {
        console.log(`${new Date().toLocaleString()} - Error: Car not found - License Plate: ${licensePlate}`);
        return res.status(404).json({ message: 'Car not found.' });
    }

    console.log(`${new Date().toLocaleString()} - Request: Get car by license plate - License Plate: ${licensePlate}`);
    res.status(200).json(car);
};

exports.update = (req, res) => {
    const { license_plate, color, new_license_plate } = req.body;
    const licensePlate = license_plate.toUpperCase();
    const newLicensePlate = new_license_plate ? new_license_plate.toUpperCase() : licensePlate;

    const carIndex = cars.findIndex(c => c.licensePlate === licensePlate);

    if (carIndex === -1) {
        console.log(`${new Date().toLocaleString()} - Error: Car not found - License Plate: ${licensePlate}.`);
        if (req.file) {
            // Eliminar la foto subida si la actualización falla
            fs.unlink(`./uploads/${req.file.filename}`, (err) => {
                if (err) {
                    console.error(`Failed to delete uploaded file: ${req.file.filename}`);
                }
            });
        }
        return res.status(404).json({ message: 'Car not found.' });
    }

    const updatedCar = {
        ...cars[carIndex],
        licensePlate: newLicensePlate,
        color: color || cars[carIndex].color,
    };

    if (req.file) {
        if (cars[carIndex].imagePath) {
            fs.unlink(`./uploads/${cars[carIndex].imagePath}`, (err) => {
                if (err) {
                    console.error(`Failed to delete old file: ${cars[carIndex].imagePath}`);
                }
            });
        }
        updatedCar.imagePath = req.file.filename;
    }

    cars[carIndex] = updatedCar;

    console.log(`${new Date().toLocaleString()} - Request: Update car - License Plate: ${licensePlate}.`);
    res.status(200).json({ message: 'Car updated successfully.', car: updatedCar });
};

exports.withdraw = (req, res) => {
    const licensePlate = req.body.license_plate.toUpperCase();
    const carIndex = cars.findIndex(c => c.licensePlate === licensePlate);

    if (carIndex > -1) {
        const [withdrawnCar] = cars.splice(carIndex, 1);
        console.log(`${new Date().toLocaleString()} - Request: Withdraw car - License Plate: ${licensePlate}.`);
        res.status(200).json({ message: 'Car withdrawn successfully.', car: withdrawnCar });
    } else {
        console.log(`${new Date().toLocaleString()} - Error: Car not found - License Plate: ${licensePlate}.`);
        res.status(404).json({ message: 'Car not found.' });
    }
};

/*const Car = require('../models/Car');

let cars = [];

exports.register = async (req, res) => {
    const { license_plate, color } = req.body;
    const licensePlate = license_plate.toUpperCase();
    const imagePath = req.file ? req.file.filename : '';

    try {
        const existingCar = await Car.findOne({ licensePlate: licensePlate });

        if (existingCar) {
            console.log(`${new Date().toLocaleString()} - Error: Car registration - License Plate: ${licensePlate} already registered.`);
            return res.status(400).json({ message: 'Car with this license plate is already registered.' });
        }

        const newCar = await Car.create({
            licensePlate: licensePlate,
            color: color,
            imagePath: imagePath
        });

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
            return res.status(404).json({ message: 'No cars registered.' });
        }

        res.status(200).json(cars);
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

        console.log(`${new Date().toLocaleString()} - Request: Get car by license plate - License Plate: ${licensePlate}`);
        res.status(200).json(car);
    } catch (err) {
        console.log(`${new Date().toLocaleString()} - Error: Get car by license plate - License Plate: ${licensePlate} - ${err}`);
        res.status(500).json({ message: 'Error getting car by license plate.' });
    }
};

exports.update = async (req, res) => {
    const { license_plate, color, new_license_plate } = req.body;
    const licensePlate = license_plate.toUpperCase();
    const newLicensePlate = new_license_plate ? new_license_plate.toUpperCase() : null;

    try {
        const car = await Car.findOne({ licensePlate: licensePlate });

        if (!car) {
            console.log(`${new Date().toLocaleString()} - Error: Car not found - License Plate: ${licensePlate}.`);
            return res.status(404).json({ message: 'Car not found.' });
        }

        car.color = color || car.color;
        car.licensePlate = newLicensePlate || car.licensePlate;

        if (req.file) {
            car.imagePath = req.file.filename;
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
};*/