const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dishorde.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

const createTables = () => {
    const playersTable = `
    CREATE TABLE IF NOT EXISTS Players (
        discord_id TEXT PRIMARY KEY,
        game_id TEXT UNIQUE,
        cross_id TEXT,
        currency INTEGER DEFAULT 0,
        total_logged_in_time_seconds INTEGER DEFAULT 0,
        registered_at DATETIME,
        last_seen_at DATETIME,
        home_x REAL,
        home_y REAL,
        home_z REAL,
        home_set BOOLEAN DEFAULT FALSE
    );`;

    const serverLoggingTable = `
    CREATE TABLE IF NOT EXISTS ServerLogging (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        game_id TEXT,
        discord_id TEXT,
        content TEXT
    );`;

    db.exec(playersTable, (err) => {
        if (err) {
            console.error('Error creating Players table', err.message);
        }
    });

    db.exec(serverLoggingTable, (err) => {
        if (err) {
            console.error('Error creating ServerLogging table', err.message);
        }
    });
};

module.exports = db; 