const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const apiRoute = require('./routes/index');
const mongoDbConfig = require('./config/mongoDbConfig');

const port = 1769

// Call the mongoDbConfig function to establish the database connection
mongoDbConfig();

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    console.log('Server is running....');
    res.send('Server is running....');
});

app.use('/api', apiRoute);

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
