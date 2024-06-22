const sqlite3 = require('sqlite3').verbose();

class UserDatabase {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath);
    this.createTable();

  }

  createTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        verified BOOLEAN DEFAULT 0,
        refreshToken TEXT
      )
    `);
  }

  async addUser(username, password, verified = false, refreshToken = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (username, password, verified, refreshToken) VALUES (?, ?, ?, ?)',
        [username, password, verified ? 1 : 0, refreshToken],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getUserById(id){
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }
   async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async updateUser(username, password, verified, refreshToken ){
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET username = ?, password = ?, verified = ?, refreshToken = ? WHERE username = ?',
        [username, password, verified ? 1 : 0, refreshToken, username],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }
}

  module.exports = UserDatabase;
