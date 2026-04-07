import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configure SSL for production (Neon requires SSL)
let poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'logiedge_billing',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
};

// Add SSL configuration for Neon in production
if (process.env.DB_SSL === 'require' || process.env.NODE_ENV === 'production') {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
    console.log('✓ SSL connection enabled for Neon database');
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;
