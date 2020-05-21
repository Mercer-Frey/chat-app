class Message {
    constructor(host, template, dataMessage, insert = 'beforeend') {
        this.host = document.querySelector(host)
        this.template = document.querySelector(template)
        this.message = dataMessage.text;
        this.username = dataMessage.username;
        this.createdAt = moment(dataMessage.createdAt).format('h:m:ss a');
        this.insert = insert;

        const importedNode = document.importNode(this.template.content, true)
        this.element = importedNode.firstElementChild
        this.element.querySelector('#createdAt').insertAdjacentHTML('afterbegin', this.createdAt)
        this.element.querySelector('#user-name').insertAdjacentHTML('afterbegin', this.username)
        if (this.element.querySelector('a')) {
            this.element.querySelector('.text-message').insertAdjacentHTML('afterbegin', 'My current location');
            this.element.querySelector('a').href = this.message
            this.element.querySelector('a').setAttribute('target', '_blank')
        } else {
            this.element.querySelector('.text-message').insertAdjacentHTML('afterbegin', this.message);
        }
    }
    attach() {
        this.host.insertAdjacentElement(this.insert, this.element)
    }
}
class Sidebar {
    constructor(host, template, roomData, insert = 'beforeend') {
        this.host = document.querySelector(host)
        this.template = document.querySelector(template)
        this.room = roomData.room
        this.users = roomData.users
        this.insert = insert;

        const importedNode = document.importNode(this.template.content, true)
        this.element = importedNode.firstElementChild
        this.element.querySelector('.room-title').insertAdjacentHTML('afterbegin', this.room)
        this.users.forEach(user => {
            const li = document.createElement('li')
            li.textContent = user.username;
            this.element.querySelector('.users').insertAdjacentElement('beforeend', li)
        })
        console.log(this.element)
    }
    attach() {
        this.host.innerHTML = '';
        this.host.insertAdjacentElement(this.insert, this.element)
    }
}
const socket = io();
const $formMs = document.querySelector('#form-send')
const $inputMs = document.querySelector('#message')
const $buttonMs = $formMs.querySelector('#send')
const $btnLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const dataRoom = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('log', logFromServer => {
    console.log(logFromServer)
})

socket.on('message', dataMessage => {
    console.log(dataMessage)
    const message = new Message('#messages', '#message-template', dataMessage)
    message.attach()
    autoscroll()
})

socket.on('locationMessage', dataMessage => {
    console.log(dataMessage)
    const message = new Message('#messages', '#location-template', dataMessage)
    message.attach()
    autoscroll()
})

$formMs.addEventListener('submit', event => {
    event.preventDefault()
    $buttonMs.setAttribute('disabled', 'disabled')
    const message = $inputMs.value

    socket.emit('sendMessage', message, (error) => {
        $buttonMs.removeAttribute('disabled')
        if (error) {
            return console.log(error)
        }
        $inputMs.value = ''
        $inputMs.focus()
        console.log('message was delivered')
    })
})

$btnLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by you browser.')
    }

    $btnLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', { lat: position.coords.latitude, long: position.coords.longitude }, () => {
            console.log('Location is shared')
            $btnLocation.removeAttribute('disabled')
        })
    })
})

socket.emit('join', dataRoom, error => {
    if (error) {
        alert('User is in use')
        location.href = '/'
    }
})

socket.on('roomData', roomData => {

    const sidebar = new Sidebar('.chat__sidebar', '#sidebar-template', roomData)
    sidebar.attach()
})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
        // height new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHight = $newMessage.offsetHeight + newMessageMargin
        // height visible
    const visibleHeight = $messages.offsetHeight
        // height container
    const containerHeight = $messages.scrollHeight
        // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}