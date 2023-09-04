const express = require('express');
const app = express();
const server = require('http').createServer(app);
const settings = require('./settings.json');
const Utils = require("./utils.js");
// c onst Filter = require('bad-words');
// const filter = new Filter();

app.use(express.static(__dirname + "/client"));

let rooms = {};
const io = require('socket.io')(server, {
    cors: {
        origin: ['*'],
    }
});

var port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("BonziWORLD Rewrite online!");
});

function newRoom(rid) {
    rooms[rid] = new Room(rid);
}

io.on('connection', (socket) => {
    var id = Utils.guidGen();
    socket.login = false;
    socket.guid = id;
    let bc = settings.colors;
    socket.pitch = Utils.randomRangeInt(settings.pitch.min, settings.pitch.max);
    socket.speed = Utils.randomRangeInt(settings.speed.min, settings.speed.max);
    socket.name = "BonziBUDDY";
    socket.room = mainroom;

    for (let u in socket.room.users) {
        const users = socket.room.users;
        socket.emit("adduser", {
            loginData: {
                name: users[u].name
            },
            color: users[u].color,
            pitch: users[u].pitch,
            speed: users[u].speed,
            id: users[u].id
        });
    }

    socket.on("set_color", (data) => {
        socket.room.updateUser(socket, {
            name: socket.name,
            color: data.color,
            pitch: socket.pitch,
            speed: socket.speed,
            id: socket.guid
        });
        socket.color = data.color;
    });

    socket.on("login", (data) => {
        if (!socket.login) {
            let rid = data.rid;
            if (typeof rid == "undefined" || rid === "" || rid === "default") {

            } else {
                socket.room.leaveLocal(socket);
                newRoom(rid);
                socket.room = rooms[rid];
            }
            var color = bc[Math.floor(Math.random() * bc.length)];
            socket.userdata = {
                name: data.name,
                color: color,
                pitch: socket.pitch,
                speed: socket.speed,
                id: socket.guid
            }
            socket.room.join(socket, socket.userdata);
            socket.room.emit("adduser", {
                loginData: data,
                color: color,
                pitch: socket.pitch,
                speed: socket.speed,
                id: socket.guid
            });
            socket.name = data.name;
            socket.color = color;
            socket.login = true;
        }
    });

    socket.on("disconnect", (data) => {
        socket.room.leave(socket, socket.userdata);
    });

    socket.on("talk", (data) => {
        socket.room.emit("talk", {
            text: data,
            id: socket.guid,
            pitch: socket.pitch,
            speed: socket.speed
        });
        var text = filter.clean(data);
        if (text.length < 1000 && !cool) {
            try {
                cool = true;
                setTimeout(function () {
                    cool = false;
                }, 3000);
            } catch (e) {
                console.log("WTF?: " + e);
            }
        }
    });

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
        let userIndex = this.users.indexOf(user);

        if (userIndex == -1) return;
        this.users.splice(userIndex, 1);

        this.users.push(userdata);
        user.color = userdata.color;

        user.userdata = userdata;
        io.emit("updateColor", {
            color: userdata.color,
            id: user.guid
        });
    }

    emit(cmd, data) {
        io.to(this.rid).emit(cmd, data);
    }

    leave(user, userdata) {
        try {
            io.emit("leave", {
                id: user.guid,
            });

            let userSocketIndex = this.userSockets.indexOf(user);

            if (userSocketIndex == -1) return;
            this.userSockets.splice(userSocketIndex, 1);

            let userIndex = this.users.indexOf(userdata);

            if (userIndex == -1) return;
            this.users.splice(userIndex, 1);

        } catch (e) {
            console.error(e);
        }
    }

    leaveLocal(socket) {
        try {
            this.userSockets.forEach((user) => {
                socket.emit("leave", {
                    id: user.guid,
                });
            });
        } catch (e) {
            console.error(e);
        }
    }
}

const mainroom = new Room('default');
