
const { Pool } = require('pg');

require('dotenv').config(); 
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect((err, client, done) => {
  if (err) {
    return console.error('--- ❌ ERROR: Could not connect to PostgreSQL ---', err.stack);
  }
  console.log('--- ✅ SUCCESS: Connected to PostgreSQL database! ---');
 
  done(); 
});


module.exports = pool;