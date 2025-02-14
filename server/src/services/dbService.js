import mysql from 'mysql2/promise';

let conn;

export async function dbConnection() {
    conn = await mysql.createConnection({
        host: process.env.HOST,
        user: "root",
        database: "chat",
        password: "",
    });

    conn.on('error', (err) => {
        console.log(err);
    });

    await conn.connect();
}

export function getDbConnection() {
    return conn;
}

