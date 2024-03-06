const cors = require('cors');
const express = require('express');
//const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const app = express();

/*mongoose.connect('mongodb://localhost:27017/parkingServiceBD', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));*/

console.log(`${new Date().toLocaleString()} - Application starting...`);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        const filename = file.fieldname + '-' + Date.now() + fileExt;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const routes = require('./routes/routes');
app.use('/cars', routes(upload));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`${new Date().toLocaleString()} - Server listening on port ${PORT}.`);
});

