module.exports = function (upload) {
    const express = require('express');
    const router = express.Router();
    const parkingController = require('../controllers/parkingController');

    router.get('/test-connection', (req, res) => {
        const clientIp = req.ip || req.socket.remoteAddress;
        console.log(`${new Date().toLocaleString()} - New Connection to Server - Client IP: ${clientIp}`);
        res.status(200).send('OK');
    });

    router.post('/register', upload.single('photo'), parkingController.register);
    router.get('/list', parkingController.list);
    router.get('/:licensePlate', parkingController.getCarByLicensePlate);
    router.patch('/update', upload.single('photo'), parkingController.update);
    router.delete('/withdraw', parkingController.withdraw);
    
    return router;
};