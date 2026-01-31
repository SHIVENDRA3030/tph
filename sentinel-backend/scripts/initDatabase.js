/**
 * Database Initialization Script
 * Creates database and enables PostGIS extension
 */

const { Client } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: 'postgres' // Connect to default database first
};

const targetDatabase = process.env.DB_NAME || 'sentinel_db';

async function initDatabase() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if database exists
    const checkResult = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDatabase]
    );

    if (checkResult.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE ${targetDatabase}`);
      console.log(`Database '${targetDatabase}' created successfully`);
    } else {
      console.log(`Database '${targetDatabase}' already exists`);
    }

    // Connect to target database to enable PostGIS
    const targetClient = new Client({
      ...config,
      database: targetDatabase
    });

    await targetClient.connect();
    console.log(`Connected to ${targetDatabase}`);

    // Enable PostGIS extension
    await targetClient.query('CREATE EXTENSION IF NOT EXISTS postgis');
    console.log('PostGIS extension enabled');

    // Enable additional extensions
    await targetClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('UUID extension enabled');

    await targetClient.end();
    console.log('Database initialization complete!');

  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
