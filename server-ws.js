'use strict'

var WebSocketServer = require('ws').Server
var server = require('http').createServer()
var { port } = require('./server.config')
var app = require('./server-http')
var ws = new WebSocketServer({
  server: server
})

// mount the app here
server.on('request', app)

var datastore = {
  userReady: {},
  userData: {},
  userLookup: {},
  roundNum: 1,
  countDownHandle: undefined,
  countDownSec: undefined,
  isCountingDown: false
}
var uid = 0

var clientHandler = require('./websocket-handlers/clientHandler')
var ping = require('./websocket-handlers/ping')

ws.on('connection', (client) => {
  clientHandler(client, uid, ws, datastore)
  uid++
})
ping(ws, datastore) // will ping at the interval specified in the settings

server.listen(80, () => {
  console.log(`Brainstorm App started listening on port ${port}`)
})
