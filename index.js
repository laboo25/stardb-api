require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const apiRoute = require('./routes/index');
const mongoDbConfig = require('./config/mongoDbConfig');

// Use PORT environment variable or default to 3000
const port = process.env.PORT || 3000;

// Call the mongoDbConfig function to establish the database connection
mongoDbConfig();

// Middleware to enable CORS
app.use(cors({
  origin: 'https://star-database.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Automatically handle preflight requests
app.options('*', cors());

// Middleware to parse JSON bodies with even larger payload size limit
app.use(bodyParser.json({ limit: '300mb' })); 
app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }));

// Error handling middleware for large payloads and other errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ message: 'Bad Request: Invalid JSON' });
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum size allowed is 300MB per file.' });
  }
  next();
});

// Route to test if server is running
app.get('/', (req, res) => {
  res.send('Server is running....');
});

// Routes for your API
app.use('/api', apiRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
