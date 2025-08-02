
import mysql from 'mysql2/promise';
import logger from './logger';

let pool: mysql.Pool | null = null;

const getDbConfig = () => {
  // Check if any of the required environment variables for remote DB are set
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
    // Fallback to a default local configuration if .env is not set
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

const initializePool = () => {
    if (!pool) {
        try {
            const config = getDbConfig();
            pool = mysql.createPool(config);
            logger.info('Database pool initialized successfully.');
        } catch(error: any) {
            logger.error('Failed to initialize database pool', { error: error.message, stack: error.stack });
            pool = null; // Ensure pool is null on failure
        }
    }
    return pool;
}

const getDbConnection = async () => {
    const currentPool = initializePool();

    if (!currentPool) {
        const errorMessage = 'Database pool is not available. Check logs for initialization errors.';
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    try {
        const connection = await currentPool.getConnection();
        logger.info('Successfully acquired a database connection.');
        return connection;
    } catch (error: any) {
        logger.error('Failed to get a database connection from the pool.', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        throw new Error(`Could not connect to the database. Please check database status and configuration. Error: ${error.code}`);
    }
};

// For direct queries if needed, though getting a connection is safer for transactions
const db = {
    query: async (sql: string, params?: any[]) => {
        const connection = await getDbConnection();
        try {
            const [rows, fields] = await connection.query(sql, params);
            return rows;
        } finally {
            connection.release();
        }
    },
    execute: async (sql: string, params?: any[]) => {
        const connection = await getDbConnection();
        try {
            const [rows, fields] = await connection.execute(sql, params);
            return rows;
        } finally {
            connection.release();
        }
    },
    getConnection: getDbConnection
};


export { db, getDbConnection };
