// test variables
var roomSize = 2
var currentRound = 1
var countDownTime = 3
var usersReady = {}
var usersData = {}
var usersLookup = {}
var countDown // storing setInterval()

var ws = require('ws')
var events = require('events')
var customEvents = new events.EventEmitter()

// =============================================================================

// Websocket server

var WebSocketServer = ws.Server

var ws = new WebSocketServer({ port: 80 })
var uid = 0
ws.on('connection', function (client) {
  uid++
  client.id = require('crypto').createHash('md5').update(`${uid}`).digest('hex')
  client.isAlive = true
  client.on('pong', heartbeat)

  client.on('message', function (raw) {
    message = JSON.parse(raw)
    console.log('received from "%s": [%s] %s', message.name, message.type, message.message)

    if (typeof (message) !== 'object') {
      client.send(JSON.stringify({
        type: 'error',
        message: "Message has to be of type 'object'"
      }))
    } else {
      switch (message.type) {
        case 'register':
          usersReady[message.name] = false
          usersLookup[this.id] = message.name
          customEvents.emit('newUser', {
            message: 'new user added to data store',
            name: message.name
          })

          client.send(JSON.stringify({
            type: 'success',
            message: 'You are connected and registered!',
            users: usersReady
          }))

          console.log(usersReady)
          break

        case 'ready':
          usersReady[message.name] = true
          customEvents.emit('readyStateChange', {
            message: 'user changed ready state',
            name: message.name
          })

          if (Object.keys(usersLookup).length === roomSize) {
            // if everyone ready
            allReady = true
            for (let user of Object.values(usersLookup)) {
              if (!usersReady[user]) {
                allReady = false
                break
              }
            }
            if (allReady) {
              var sec = countDownTime
              countDown = setInterval(() => {
                if (sec !== 0) {
                  console.log(`Counting Down: ${sec} seconds left.`)
                } else {
                  console.log('Countdown Complete, Round Starting!')
                  clearInterval(countDown)
                }
                customEvents.emit('countDown', {
                  timeLeft: sec
                })
                sec--
              }, 1000)
            }
          }

          break

        case 'unready':
          usersReady[message.name] = false
          customEvents.emit('readyStateChange', {
            message: 'user changed ready state',
            name: message.name
          })

          console.log(usersReady)
          if (countDown) {
            clearInterval(countDown)
            customEvents.emit('countDownStop')
          }
          break

        case 'submission':
          switch (message.roundNum) {
            case 1:
              usersData[message.name] = {
                roundOneIdeas: message.data
              }
              client.send(JSON.stringify({
                type: 'success',
                message: 'Your form was successfully submitted and recorded',
                users: usersReady
              }))
              break
            case 2:
              usersData[message.name].roundTwoIdeas = message.data
              client.send(JSON.stringify({
                type: 'success',
                message: 'Your form was successfully submitted and recorded',
                users: usersReady
              }))
              break
            case 3:
              usersData[message.name].votedFor = message.data
              // handle vote result from user
              client.send(JSON.stringify({
                type: 'over',
                message: 'The session is over, terminating and sending final results',
                data: ['some-final-results']
              }))
              break
          }
          console.log(message.data)
          console.log('-------------------------------------------------------')
          break
      }
    }
  })

  client.on('close', function (e) {
    customEvents.emit('connectionClose', {
      message: 'user disconnected',
      user: usersLookup[this.id],
      userId: this.id
    })
  })
})

// =============================================================================

// handling custom events

customEvents.on('newUser', function (ev) {
  ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'newUser',
      message: 'New user connected to room',
      user: ev.name,
      users: usersReady
    }))
  })
})

customEvents.on('readyStateChange', function (ev) {
  ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'readyStateChange',
      message: 'Someone changed ready state',
      user: ev.name,
      users: usersReady
    }))
  })
})

customEvents.on('countDown', function (ev) {
  if (ev.timeLeft > 0) {
    ws.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'countDown',
        message: 'Counting down before round starts',
        timeLeft: ev.timeLeft
      }))
    })
  } else {
    Object.keys(usersReady).forEach(user => {
      usersReady[user] = false
    })
    switch (currentRound) {
      case 1:
        formData = []
        break
      case 2:
        formData = usersData
        break
      case 3:
        formData = usersData
        break
    }
    ws.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'roundStart',
        message: 'Starting round',
        roundNum: currentRound,
        data: formData
      }))
    })
    currentRound++
  }
})

customEvents.on('countDownStop', function (ev) {
  ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'countDownStop',
      message: 'Stop the countdown'
    }))
  })
})

customEvents.on('connectionClose', function (ev) {
  console.log(`${ev.user} disconnected`)
  delete usersReady[ev.user]
  delete usersLookup[ev.userId]
  ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'userDisconnect',
      message: 'Someone disconnected',
      users: usersReady
    }))
  })
})

// =============================================================================

// operations for detecting dropped connections

function noop () {}

function heartbeat () {
  this.isAlive = true
}

var hasDropped = false
const interval = setInterval(function ping () {
  ws.clients.forEach(function each (client) {
    if (client.isAlive === false) {
      hasDropped = true
      delete usersReady[ev.user]
      delete usersLookup[ev.userId]
      return client.terminate()
    }
    client.isAlive = false
    client.ping(noop)
  })
  if (hasDropped) {
    console.log('Someone dropped, notifying all other clients')
    ws.clients.forEach(function each (client) {
      client.send(JSON.stringify({
        type: 'userDisconnect',
        message: 'Someone disconnected',
        users: usersReady
      }))
    })
  }
}, 15000)

module.exports = ws
