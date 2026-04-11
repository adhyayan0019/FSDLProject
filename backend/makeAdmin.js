const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const email = process.argv[2];

if (!email) {
    console.log("Usage: node makeAdmin.js <user-email>");
    process.exit(1);
}

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
});

db.run(`UPDATE users SET role = 'admin' WHERE email = ?`, [email], function(err) {
    if (err) {
        console.error('Error updating user', err.message);
    } else if (this.changes === 0) {
        console.log(`No user found with email: ${email}`);
    } else {
        console.log(`Successfully promoted ${email} to admin!`);
    }
    db.close();
});
