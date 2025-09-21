// backend/database.js

const { Pool } = require('pg');
// Load environment variables immediately
require('dotenv').config();

// Define the connection Pool using the full connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // REQUIRED BY NEON: Enforce SSL connection for security.
  // The 'rejectUnauthorized: false' bypasses the "self-signed certificate" error
  // you encountered during local development.
  ssl: {
    rejectUnauthorized: false, 
  }
});

// Add an error handler for the connection pool itself
pool.on('error', (err, client) => {
  console.error('CRITICAL: Unexpected error on idle database client:', err);
  // Exiting helps ensure the app doesn't continue running in a broken state
  process.exit(1); 
});

/**
 * Defines the core query execution function. This is what your index.js will call.
 * @param {string} text - The raw SQL query string.
 * @param {Array<any>} params - The parameters to safely inject into the query.
 * @returns {Promise<import('pg').QueryResult<any>>} The query result object.
 */
const executeQuery = (text, params = []) => {
    // Note: Logging the query here helps debug PostGIS syntax errors later.
    console.log('EXECUTING QUERY:', text); 
    return pool.query(text, params);
};


// Export the function and the pool instance
module.exports = {
  query: executeQuery, 
  pool,
};