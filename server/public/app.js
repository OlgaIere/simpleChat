const socket = io('ws://localhost:3500')

// const submitMessage = document.querySelector('#submitMessage');
const msgInput = document.querySelector('#message');
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
const activity = document.querySelector('.activity');
const usersList = document.querySelector('.user-list');
const roomList = document.querySelector('.room-list');
const chatDisplay = document.querySelector('.chat-display');

const alertClasses = ["secondary", "danger", "success", "warning", "info", "light"];
const random = Math.floor(Math.random() * alertClasses.length);
const alertClass = alertClasses[random];


function sendMessage(e) {
    e.preventDefault();

    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value,
            className: alertClass
        });
        msgInput.value = "";
    }
    msgInput.focus();
}

function enterRoom(e) {
    e.preventDefault();
    if (nameInput.value && chatRoom.value) {
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        });
        console.log("Ctoto")
    }
}

function userMessage(name, time, text, alertClass) {
    const li = document.createElement('li');

    li.className = `alert alert-${alertClass}`;
    if (name === nameInput.value) li.id = 'post--left'
    if (name !== nameInput.value && name !== 'Admin') li.id = 'post--right'

    li.innerHTML = `
        
        <div class="post__header">
            <span class="post__header--name">${name}:</span> 
            <span class="post__header--time">${time}</span> 
        </div>
        <div class="post-text">${text}</div>`;
    chatDisplay.appendChild(li);
}
//When we press join, turn up sendMessage action
const formMessage = document.querySelector('.form-msg');
formMessage.addEventListener('submit', sendMessage);

//When we press join, turn up enterRoom action
document.querySelector('.form-join')
    .addEventListener('submit', enterRoom);

//Which user be active now
msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value);
})

// Listen for messages 
socket.on("message", (data) => {
    activity.textContent = "";
    const { name, text, time, className } = data;

    userMessage(name, time, text, className);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
})

let activityTimer;
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`;

    // Clear after 3 seconds 
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        activity.textContent = "";
    }, 3000);
});

socket.on('userList', ({ users }) => {
    showUsers(users);
})

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms);
})

function showUsers(users) {
    usersList.textContent = '';
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`
        users.forEach((user, i) => {
            usersList.textContent += ` ${user.name}`;
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ",";
            }
        });
    }
}

function showRooms(rooms) {
    roomList.textContent = '';
    if (rooms) {
        roomList.innerHTML = '<em>Active Rooms:</em>';
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`;
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ",";
            }
        });
    }
}