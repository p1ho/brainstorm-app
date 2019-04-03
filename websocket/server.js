var ws = require('ws');

// Websocket server
var WebSocketServer = ws.Server,
ws = new WebSocketServer({port: 80})
ws.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message)
  })
  ws.send(JSON.stringify(`WebSocket Connection: ${Object.keys(ws)}`))
})

module.exports = ws;
