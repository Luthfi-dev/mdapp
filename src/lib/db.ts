
import mysql from 'mysql2/promise';

// Check for essential environment variables at the module level
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

let db: mysql.Pool;

if (missingVars.length > 0) {
  console.warn(
    `[DATABASE WARNING] The following required environment variables are missing: ${missingVars.join(', ')}. ` +
    'The application will run without a database connection. This is expected during build time or if no database is configured.'
  );
  // Create a mock pool that will throw an error if used
  // This prevents the app from crashing on startup if DB is not configured.
  const handler = {
    get: function(target: any, prop: any) {
      if (prop === 'getConnection') {
         return () => Promise.reject(new Error('Database is not configured. Please check your .env file.'));
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
  });

  // Test the connection
  db.getConnection()
    .then(connection => {
      console.log('Successfully connected to the database.');
      connection.release();
    })
    .catch(err => {
      console.error('Error connecting to the database:', err.stack);
    });
}

export { db };
