
import mysql from 'mysql2/promise';

const getDbConfig = () => {
  // Check if any of the required environment variables for remote DB are set
  const hasRemoteDbConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

  if (hasRemoteDbConfig) {
    console.log("Using database configuration from .env file.");
    return {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000, // 10 seconds
    };
  } else {
    // Fallback to a default local configuration if .env is not set
    console.warn("[DATABASE WARNING] No .env database configuration found. Falling back to default localhost settings.");
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

// Create the pool directly using the config logic
const db: mysql.Pool = mysql.createPool(getDbConfig());

// Export a custom function to get connection that includes a pre-flight check
const getDbConnection = async () => {
    try {
        const connection = await db.getConnection();
        // A simple query to ensure the connection is truly active
        await connection.query('SELECT 1'); 
        return connection;
    } catch (error: any) {
        console.error(`[DATABASE FATAL] Failed to get a database connection: ${error.message}`);
        // Re-throw a more user-friendly error to be caught by API routes
        throw new Error(`Could not connect to the database. Please ensure the database is running and .env configuration is correct. Detail: ${error.code || 'Unknown Error'}`);
    }
};


export { db, getDbConnection };
