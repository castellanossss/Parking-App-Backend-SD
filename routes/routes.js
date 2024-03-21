const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/test-connection', (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress;
    console.log(`${new Date().toLocaleString()} - New Connection to Server - Client IP: ${clientIp}`);
    res.status(200).send('OK');
});

router.get('/test', (req, res) => {
    res.status(200).send('Test route is working');
    console.log("Received bro!");
});

router.post('/register2', parkingController.register2);
router.post('/register', upload.single('photo'), parkingController.register);
router.get('/list', parkingController.list);
router.get('/:licensePlate', parkingController.getCarByLicensePlate);
router.patch('/update', upload.single('photo'), parkingController.update);
router.delete('/withdraw/:licensePlate', parkingController.withdraw);

module.exports = router;