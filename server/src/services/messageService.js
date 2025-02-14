import { getDbConnection } from './dbService.js';

export async function saveMessage(text, userId, roomId) {
    const conn = getDbConnection();
    const sql = 'INSERT INTO messages (text_message, data_send_mes, id_user, id_room) VALUES (?, NOW(), ?, ?)';
    const [result] = await conn.query(sql, [text, userId, roomId]);
    return result;
}

export async function getMessages(roomId) {
    const conn = getDbConnection();
    const sql = 'SELECT users.user_name, messages.text_message, messages.data_send_mes FROM messages JOIN users ON messages.id_user = users.id_user WHERE messages.id_room = ? ORDER BY messages.data_send_mes';
    const [result] = await conn.query(sql, [roomId]);
    return result;
}