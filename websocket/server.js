'use strict'

var WebSocketServer = require('ws').Server
var ws = new WebSocketServer({ port: 80 })

var datastore = {
  userReady: {},
  userData: {},
  userLookup: {},
  roundNum: 1
}
var uid = 0

var clientHandler = require('./handlers/clientHandler')
var ping = require('./ping')

ws.on('connection', (client) => {
  clientHandler(client, uid, ws, datastore)
  uid++
})
ping(ws, datastore) // will ping at the interval specified in the settings

module.exports = ws
