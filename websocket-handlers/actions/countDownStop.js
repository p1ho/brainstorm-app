'use strict'

module.exports = (ev) => {
  ev.ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'countDownStop',
      message: 'Stop the countdown'
    }))
  })
}
