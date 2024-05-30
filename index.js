require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const apiRoute = require('./routes/index');
const mongoDbConfig = require('./config/mongoDbConfig');

const port = process.env.PORT || 3000; // Use PORT environment variable or default to 3000

// Call the mongoDbConfig function to establish the database connection
mongoDbConfig();

// Middleware to enable CORS
app.use(cors({
  origin: '*', // Replace with your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
