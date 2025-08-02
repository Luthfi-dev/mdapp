
import mysql from 'mysql2/promise';

const getDbConfig = () => {
  const hasEnvConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

  if (hasEnvConfig) {
    console.log("Menggunakan konfigurasi database dari file .env");
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
    console.warn("[DATABASE WARNING] Konfigurasi .env tidak ditemukan. Menggunakan fallback ke localhost.");
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
}

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
        console.error(`[DATABASE FATAL] Gagal mendapatkan koneksi database: ${error.message}`);
        // Re-throw a more user-friendly error to be caught by API routes
        throw new Error(`Tidak dapat terhubung ke database. Pastikan database berjalan dan konfigurasi .env sudah benar. Detail: ${error.code}`);
    }
};


export { db, getDbConnection };
