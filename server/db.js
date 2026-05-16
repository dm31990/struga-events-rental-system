const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "strugaevents"
});

db.connect((err) => {
    if (err) {
        console.log("DB connection failed");
    } else {
        console.log("Connected to MySQL");
    }
});

module.exports = db;