import sqlite3 from 'sqlite3';

const dbPath = 'database.sqlite'; // Use an in-memory database for testing, change this to your actual SQLite database path

// Initialize the SQLite database connection
const db = new sqlite3.Database(dbPath);

export async function startTransaction() {
  return new Promise<void>((resolve, reject) => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function rollbackTransaction() {
  return new Promise<void>((resolve, reject) => {
    db.run('ROLLBACK', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function cleanupDatabase() {
  // Implement cleaning up the database after each test
  // For example, you can delete data from specific tables or perform other cleanup tasks
  // Note: Adjust this based on your actual database schema and cleanup requirements
  const tablesToCleanup = ['user', 'comment', 'post', 'user_followers_user'];

  const deletePromises = tablesToCleanup.map((table) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`DELETE FROM ${table}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  return Promise.all(deletePromises);
}
