const path = require('path')
const http = require('http')
const express = require('express')
const socket = require('socket.io')
const Filter = require('bad-words')

const { generateMessage } = require('./utils/messages')
const User = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socket(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('on connection');


    socket.on('join', (options, cb) => {
        console.log(options)
        const user = User.addUser({ id: socket.id, ...options });

        if (!user) {
            return cb('something went wrong')
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('welcome', 'Admin'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} Has Joined`, user.username))
        io.to(user.room).emit('roomData', { room: user.room, users: User.getUsersInRoom(user.room) })
        cb(user.error)
    })

    socket.on('sendMessage', (message, cb) => {
        const user = User.getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message) || message.trim() === '') {
            return cb('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(message, user.username))
        cb()
    })

    socket.on('sendLocation', (location, cb) => {
        const user = User.getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateMessage(`https://www.google.com/maps/?q=${location.lat},${location.long}`, user.username))
        cb()
    })

    socket.on('disconnect', () => {
        const user = User.getUser(socket.id)
        const room = user.room;
        console.log(user)
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`, user.username))
        }
        User.removeUser(socket.id)
        io.to(room).emit('roomData', { room, users: User.getUsersInRoom(room) })
    })
})


server.listen(port, () => {

})