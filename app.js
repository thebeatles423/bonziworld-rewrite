const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Filter = require('bad-words');
const Utils = require('./utils.js');
const settings = require('./settings.json');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['*'],
    },
});

const filter = new Filter();

const rooms = {};
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('BonziWORLD Rewrite online!');
});

class Room {
    constructor(rid) {
        this.rid = rid;
        this.users = [];
        this.userSockets = [];
    }

    join(user, userdata) {
        user.join(this.rid);
        this.users.push(userdata);
        this.userSockets.push(user);
    }

    updateUser(user, userdata) {
        console.log('New color: ' + userdata.color);
        const userIndex = this.users.indexOf(user);

        if (userIndex !== -1) {
            this.users.splice(userIndex, 1);
            this.users.push(userdata);
            user.color = userdata.color;
            user.userdata = userdata;
            io.emit('updateColor', {
                color: userdata.color,
                id: user.guid,
            });
        }
    }

    emit(cmd, data) {
        io.to(this.rid).emit(cmd, data);
    }

    leave(user, userdata) {
        try {
            io.emit('leave', {
                id: user.guid,
            });

            const userSocketIndex = this.userSockets.indexOf(user);

            if (userSocketIndex !== -1) {
                this.userSockets.splice(userSocketIndex, 1);
            }

            const userIndex = this.users.indexOf(userdata);

            if (userIndex !== -1) {
                this.users.splice(userIndex, 1);
            }
        } catch (e) {
            console.error(e);
        }
    }

    leaveLocal(socket) {
        try {
            this.userSockets.forEach((user) => {
                socket.emit('leave', {
                    id: user.guid,
                });
            });
        } catch (e) {
            console.error(e);
        }
    }
}

function newRoom(rid) {
    rooms[rid] = new Room(rid);
}

const mainroom = new Room('default');

io.on('connection', (socket) => {
    const id = Utils.guidGen();
    socket.login = false;
    socket.guid = id;
    console.log('User connected: ' + socket.guid);
    const bc = settings.colors;
    socket.pitch = Utils.randomRangeInt(settings.pitch.min, settings.pitch.max);
    socket.speed = Utils.randomRangeInt(settings.speed.min, settings.speed.max);
    socket.name = 'BonziBUDDY';
    socket.room = mainroom;

    for (const user of socket.room.users) {
        socket.emit('adduser', {
            loginData: {
                name: user.name,
            },
            color: user.color,
            pitch: user.pitch,
            speed: user.speed,
            id: user.id,
        });
    }

    socket.on('set_color', (data) => {
        socket.room.updateUser(socket, {
            name: socket.name,
            color: data.color,
            pitch: socket.pitch,
            speed: socket.speed,
            id: socket.guid,
        });
        socket.color = data.color;
    });

    socket.on('login', (data) => {
        if (!socket.login) {
            const rid = data.rid;

            if (typeof rid !== 'undefined' && rid !== '' && rid !== 'default') {
                socket.room.leaveLocal(socket);
                newRoom(rid);
                socket.room = rooms[rid];
            }

            const color = bc[Math.floor(Math.random() * bc.length)];
            socket.userdata = {
                name: data.name,
                color: color,
                pitch: socket.pitch,
                speed: socket.speed,
                id: socket.guid,
            };

            socket.room.join(socket, socket.userdata);
            socket.room.emit('adduser', {
                loginData: data,
                color: color,
                pitch: socket.pitch,
                speed: socket.speed,
                id: socket.guid,
            });

            socket.name = data.name;
            socket.color = color;
            socket.login = true;
        }
    });

    socket.on('disconnect', (data) => {
        console.log('User left: ' + socket.guid);
        socket.room.leave(socket, socket.userdata);
    });

    socket.on('talk', (data) => {
        console.log(data);
        socket.room.emit('talk', {
            text: data,
            id: socket.guid,
            pitch: socket.pitch,
            speed: socket.speed,
        });
        const text = filter.clean(data);
        if (text.length < 1000 && !cool) {
            try {
                cool = true;
                setTimeout(() => {
                    cool = false;
                }, 3000);
            } catch (e) {
                console.log('WTF?: ' + e);
            }
        }
    });
});
