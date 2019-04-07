var ws = require('ws');
var events = require('events')

var users = {}
var usersLookup = {}
var customEvents = new events.EventEmitter()

// Websocket server
var WebSocketServer = ws.Server,
ws = new WebSocketServer({port: 80})
var uid = 0
ws.on('connection', function (client) {
  uid++
  client.id = require('crypto').createHash('md5').update(`${uid}`).digest('hex')
  client.isAlive = true
  client.on('pong', heartbeat)

  client.on('message', function (raw) {
    message = JSON.parse(raw)
    console.log('received: [%s] %s', message.type, message.message)

    if (typeof(message) !== "object") {
      client.send(JSON.stringify({
        type: "error",
        message: "Message has to be of type 'object'"
      }))
    } else {
      switch (message.type) {
        case "register":
          users[message.name] = {
            ready: false
          }
          usersLookup[this.id] = message.name
          customEvents.emit('newUser', {
            message: 'new user added to data store',
            name: message.name
          })

          client.send(JSON.stringify({
            type: "success",
            message: "You are connected and registered!",
            users: users
          }))

          console.log(users)
        break

        case "ready":
          users[message.name].ready = true
          customEvents.emit('readyStateChange', {
            message: 'user changed ready state',
            name: message.name,
            users: users
          })

          console.log(users)
        break

        case "unready":
          users[message.name].ready = false
          customEvents.emit('readyStateChange', {
            message: 'user changed ready state',
            name: message.name,
            users: users
          })

          console.log(users)
        break

      }
    }
  })

  client.on('close', function(e) {
    customEvents.emit('connectionClose', {
      message: 'user disconnected',
      user: usersLookup[this.id],
      userId: this.id
    })
  })
})

customEvents.on('newUser', function (ev) {
  ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: "newUser",
      message: "New user connected to room",
      user: ev.name,
      users: users
    }))
  })
})

customEvents.on('readyStateChange', function (ev) {
  ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: "readyStateChange",
      message: "Someone changed ready state",
      user: ev.name,
      users: users
    }))
  })
})

customEvents.on('connectionClose', function (ev) {
  delete users[ev.user]
  delete usersLookup[ev.userId]
  ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: "userDisconnect",
      message: "Someone disconnected",
      users: users
    }))
  })
})

// operations for detecting dropped connections
function noop() {}

function heartbeat() {
  this.isAlive = true
}

var hasDropped = false
const interval = setInterval(function ping() {
  ws.clients.forEach(function each(client) {
    if (client.isAlive === false) {
      hasDropped = true
      delete users[ev.user]
      delete usersLookup[ev.userId]
      return client.terminate()
    }
    client.isAlive = false
    client.ping(noop)
  })
  if (hasDropped) {
    console.log("Someone dropped, notifying all other clients")
    ws.clients.forEach(function each(client) {
      client.send(JSON.stringify({
        type: "userDisconnect",
        message: "Someone disconnected",
        users: users
      }))
    })
  }
}, 15000)

module.exports = ws
