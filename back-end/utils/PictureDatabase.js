const sqlite3 = require('sqlite3').verbose();
const Picture = require("../models/picture"); // Assurez-vous que votre modèle Picture est défini correctement

class PictureDatabase {
    constructor(dbFilePath) {
        this.db = new sqlite3.Database(dbFilePath);
        this.createTable();
        this.prepareStatements();
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

    prepareStatements() {
        this.statements = {
            addPicture: this.db.prepare('INSERT INTO pictures (url, caption, user, description, hashtags) VALUES (?, ?, ?, ?, ?)'),
            getPictureById: this.db.prepare('SELECT * FROM pictures WHERE id = ?'),
            getAllPictures: this.db.prepare('SELECT * FROM pictures ORDER BY uploadDate DESC'),
            getPicturesByHashtag: this.db.prepare('SELECT * FROM pictures WHERE hashtags LIKE ?'),
            deletePictureById: this.db.prepare('DELETE FROM pictures WHERE id = ?'),
            updatePicture: this.db.prepare('UPDATE pictures SET description = ?, hashtags = ? WHERE id = ?')
        };
    }

    async addPicture(picture) {
        const { url, caption, user, description, hashtags } = picture;
        return new Promise((resolve, reject) => {
            this.statements.addPicture.run([url, caption, user, description, hashtags], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    async getPictureById(id) {
        return new Promise((resolve, reject) => {
            this.statements.getPictureById.get([id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getAllPictures() {
        return new Promise((resolve, reject) => {
            this.statements.getAllPictures.all((err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getPicturesByHashtag(hashtag) {
        const regex = `%${hashtag}%`;
        return new Promise((resolve, reject) => {
            this.statements.getPicturesByHashtag.all([regex], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async deletePictureById(id) {
        return new Promise((resolve, reject) => {
            this.statements.deletePictureById.run([id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    async updatePicture(id, description, hashtags) {
        return new Promise((resolve, reject) => {
            this.statements.updatePicture.run([description, hashtags, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    close() {
        Object.values(this.statements).forEach(statement => statement.finalize());
    }
}

module.exports = PictureDatabase;
