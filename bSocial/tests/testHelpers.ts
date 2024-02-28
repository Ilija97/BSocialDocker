import sqlite3 from 'sqlite3';

const dbPath = 'database.sqlite'; 
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
