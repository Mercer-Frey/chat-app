const users = [];

module.exports.addUser = ({ id, username, room }) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    const existingUser = users.find((user) => user.room === room && user.username === username)
    console.log(existingUser)
    if (existingUser) {
        return { error: 'User is in use' }
    }
    const user = { id, username, room }
    users.push(user)
    return user
}

module.exports.removeUser = id => {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

module.exports.getUser = id => {
    const user = users.find(user => user.id === id)
    if (user) {
        return user
    } else return undefined
}

module.exports.getUsersInRoom = room => {
    const usersRoom = users.filter(user => user.room === room)
    if (usersRoom) {
        return usersRoom
    } else return undefined
}