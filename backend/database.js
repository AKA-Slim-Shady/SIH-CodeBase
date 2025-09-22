import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err, client, done) => {
  if (err) {
    console.error('Connection error:', err.stack);
  } else {
    console.log(`✅ Connected to Neon database`);
  }
  if (done) done();
});

export default pool;
