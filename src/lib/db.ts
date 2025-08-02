
'use server';

import mysql from 'mysql2/promise';
import logger from './logger';

let pool: mysql.Pool | null = null;

const getDbConfig = () => {
  const hasRemoteDbConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

  if (hasRemoteDbConfig) {
    logger.info("Using database configuration from .env file.");
    return {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
    };
  } else {
    logger.warn("No .env database configuration found. Falling back to default localhost settings.");
    return {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'test',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
    };
  }
};

const getPool = (): mysql.Pool => {
    if (!pool) {
        try {
            const config = getDbConfig();
            pool = mysql.createPool(config);
            logger.info('Database pool initialized successfully.');
        } catch(error: any) {
            logger.error('Failed to initialize database pool', { error: error.message, stack: error.stack });
            // This re-throw is important to signal a critical configuration error
            throw new Error('Could not create a database pool. Check configuration and database server status.');
        }
    }
    return pool;
}

export async function getDbConnection() {
    try {
        const currentPool = getPool();
        const connection = await currentPool.getConnection();
        logger.info('Successfully acquired a database connection.');
        return connection;
    } catch (error: any) {
        logger.error('Failed to get a database connection from the pool.', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        // This provides a more user-friendly error for API responses
        throw new Error(`Could not connect to the database. Please check database status and configuration. Error: ${error.code || 'UNKNOWN'}`);
    }
};
