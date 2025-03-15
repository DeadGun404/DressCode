const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/users.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE,
      password TEXT,
      fullName TEXT DEFAULT NULL,
      phone TEXT DEFAULT NULL,
      email TEXT DEFAULT NULL,
      address TEXT DEFAULT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Database creation error:', err);
    } else {
      console.log('Database and table ready');
    }
  });
});

module.exports = db;