// server.js

// 1. Import necessary modules
const express = require('express');
const cors = require('cors');
// Loads environment variables from .env (must be done before accessing process.env.PORT)
require('dotenv').config(); 

// Import the PostgreSQL pool we created in db.js
const pool = require('./db'); 

// 2. Initialize the Express Application
const app = express();
const PORT = process.env.PORT || 5000; // Get the port from .env or default to 5000

// 3. Apply Middleware
// CORS: Allows your React frontend (on a different port) to talk to this API
app.use(cors()); 
// JSON Body Parser: Allows Express to read incoming request bodies in JSON format (essential for POST requests)
app.use(express.json()); 

// 4. Basic Test Route (Sanity Check)
app.get('/', (req, res) => {
  res.send('Welcome to the Furniture Brand API!');
});

// 5. Database Connection Test Route
// This route will hit the database and confirm it's working when you access it.
app.get('/api/test-db', async (req, res) => {
  try {
    // A simple query to test the connection and get the current database time
    const result = await pool.query('SELECT NOW()'); 
    res.json({ 
      message: 'Database query successful', 
      timestamp: result.rows[0].now 
    });
  } catch (err) {
    console.error('Error running DB test query:', err.message);
    // Send a 500 Internal Server Error response
    res.status(500).json({ error: 'Server Error: Could not execute database query.' });
  }
});

// 6. Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Access API at: http://localhost:${PORT}`);
});