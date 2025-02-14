import { checkUser } from '../services/userService.js';
import { checkRoom } from '../services/roomService.js';
import { saveMessage, getMessages } from '../services/messageService.js';
import MessageModel from '../models/messageModel.js';

export default class ChatController {
    constructor(io) {
        this.io = io;
        this.users = [];

        io.on('connection', (socket) => {
            this.onConnection(socket);
        });
    }

    onConnection(socket) {
        console.log(`User ${socket.id} connected`);

        socket.emit('message', this.buildMsg('Admin', 'Welcome to Chat App!'));

        socket.on('enterRoom', async ({ name, room }) => {
            let userId = await checkUser(name);
            let roomId = await checkRoom(room);

            const prevRoom = this.getUser(socket.id)?.room;
            if (prevRoom) {
                socket.leave(prevRoom);
                this.io.to(prevRoom).emit('message', this.buildMsg('Admin', `${name} has left the room`));
            }

            const user = this.activateUser(socket.id, name, room);

            if (prevRoom) {
                this.io.to(prevRoom).emit('userList', {
                    users: this.getUsersInRoom(prevRoom)
                });
            }

            socket.join(user.room);

            socket.emit('message', this.buildMsg('Admin', `You have joined the ${user.room} chat room`));

            socket.broadcast.to(user.room).emit('message', this.buildMsg('Admin', `${user.name} has joined the room`));

            this.io.to(user.room).emit('userList', {
                users: this.getUsersInRoom(user.room)
            });

            this.io.emit('roomList', {
                rooms: this.getAllActiveRooms()
            });

            const oldMessages = await getMessages(roomId);
            oldMessages.forEach(message => {
                socket.emit('message', new MessageModel(message.user_name, message.text_message, 'info', message.data_send_mes));
            });
        });

        socket.on('disconnect', () => {
            const user = this.getUser(socket.id);
            this.userLeavesApp(socket.id);

            if (user) {
                this.io.to(user.room).emit('message', this.buildMsg('Admin', `${user.name} has left the room`));
                this.io.to(user.room).emit('userList', {
                    users: this.getUsersInRoom(user.room)
                });
                this.io.emit('roomList', {
                    rooms: this.getAllActiveRooms()
                });
            }

            console.log(`User ${socket.id} disconnected`);
        });

        socket.on('message', async ({ name, text, className }) => {
            const room = this.getUser(socket.id)?.room;
            if (room) {
                let userId = await checkUser(name);
                let roomId = await checkRoom(room);
                await saveMessage(text, userId, roomId);
                this.io.to(room).emit('message', this.buildMsg(name, text, className));
            }
        });

        socket.on('activity', (name) => {
            const room = this.getUser(socket.id)?.room;
            if (room) {
                socket.broadcast.to(room).emit('activity', name);
            }
        });
    }

    buildMsg(name, text, className) {
        return {
            name,
            text,
            className,
            time: new Intl.DateTimeFormat('default', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            }).format(new Date())
        };
    }

    activateUser(id, name, room) {
        const user = { id, name, room };
        this.users = [
            ...this.users.filter(user => user.id !== id),
            user
        ];
        return user;
    }

    userLeavesApp(id) {
        this.users = this.users.filter(user => user.id !== id);
    }

    getUser(id) {
        return this.users.find(user => user.id === id);
    }

    getUsersInRoom(room) {
        return this.users.filter(user => user.room === room);
    }

    getAllActiveRooms() {
        return Array.from(new Set(this.users.map(user => user.room)));
    }
}
