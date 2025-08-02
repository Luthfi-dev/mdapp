
import mysql from 'mysql2/promise';

// Check for essential environment variables at the module level
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

let db: mysql.Pool;
let connectionError: Error | null = null;


if (missingVars.length > 0) {
  const errorMessage = `[DATABASE WARNING] The following required environment variables are missing: ${missingVars.join(', ')}. The application will run without a database connection. This is expected during build time or if no database is configured.`;
  console.warn(errorMessage);
  connectionError = new Error('Database is not configured. Please check your .env file.');
  
  // Create a mock pool that will throw an error if used
  const handler = {
    get: function(target: any, prop: any) {
      if (prop === 'getConnection') {
         return () => Promise.reject(connectionError);
      }
      return Reflect.get(target, prop);
    }
  };
  db = new Proxy({}, handler) as mysql.Pool;

} else {
  // Create a connection pool if all variables are present
  db = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds timeout
  });

  // Test the connection and store the error if it fails
  db.getConnection()
    .then(connection => {
      console.log('Successfully connected to the database.');
      connection.release();
    })
    .catch(err => {
      console.error('Initial database connection failed:', err);
      connectionError = err; // Store the connection error
      db.end().catch(endErr => console.error("Failed to close pool after connection error:", endErr)); // Attempt to close the pool
    });
}

// Export a custom function to get connection that also checks for initial error
const getDbConnection = async () => {
    if (connectionError) {
        throw new Error(`Database connection failed: ${connectionError.message}`);
    }
    return db.getConnection();
};


export { db, getDbConnection };
