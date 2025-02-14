import { getDbConnection } from './dbService.js';

export async function checkUser(userName) {
    const conn = getDbConnection();
    const sql = 'SELECT id_user FROM users WHERE user_name=?';
    const [result] = await conn.query(sql, [userName]);
    if (result.length > 0) {
        return result[0].id_user;
    } else {
        return await createUser(userName);
    }
}

export async function createUser(userName) {
    const conn = getDbConnection();
    const sql = 'INSERT INTO users SET user_name=?';
    const [result] = await conn.query(sql, [userName]);
    return result.insertId;
}