import { getDbConnection } from './dbService.js';

export async function checkRoom(roomName) {
    const conn = getDbConnection();
    const sql = 'SELECT id_room FROM rooms WHERE room_name=?';
    const [result] = await conn.query(sql, [roomName]);
    if (result.length > 0) {
        return result[0].id_room;
    } else {
        return await createRoom(roomName);
    }
}

export async function createRoom(roomName) {
    const conn = getDbConnection();
    const sql = 'INSERT INTO rooms (room_name) VALUES (?)';
    const [result] = await conn.query(sql, [roomName]);
    return result.insertId;
}