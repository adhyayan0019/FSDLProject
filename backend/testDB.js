const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    }
});

db.all(`SELECT * FROM bookings`, [], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log("Found bookings:", rows);
});

db.close();
