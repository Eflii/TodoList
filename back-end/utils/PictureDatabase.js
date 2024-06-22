const sqlite3 = require('sqlite3').verbose();
const Picture = require("../models/picture"); // Assurez-vous que votre modèle Picture est défini correctement

class PictureDatabase {
    constructor(dbFilePath) {
        this.db = new sqlite3.Database(dbFilePath);
        this.createTable();
    }

    createTable() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS pictures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                caption TEXT,
                user TEXT,
                uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                hashtags TEXT
            )
        `);
    }

    async addPicture(picture) {
        const { url, caption, user, description, hashtags } = picture;
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO pictures (url, caption, user, description, hashtags) VALUES (?, ?, ?, ?, ?)',
                [url, caption, user, description, hashtags],
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

    async getPictureById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM pictures WHERE id = ?',
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

    async getAllPictures() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM pictures ORDER BY uploadDate DESC',
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    async getPicturesByHashtag(hashtag) {
        const regex = `%${hashtag}%`;
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM pictures WHERE hashtags LIKE ?',
                [regex],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    async deletePictureById(id) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM pictures WHERE id = ?',
                [id],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                }
            );
        });
    }

    async updatePicture(id, description, hashtags) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE pictures SET description = ?, hashtags = ? WHERE id = ?',
                [description, hashtags, id],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                }
            );
        });
    }
}

module.exports = PictureDatabase;
