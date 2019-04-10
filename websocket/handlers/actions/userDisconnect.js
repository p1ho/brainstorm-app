'use strict'

const { minRoomSize, countDownTime } = require('../../settings')

module.exports = (ev) => {
  ev.client.isAlive = false

  let username = ev.datastore.userLookup[ev.userId]

  delete ev.datastore.userReady[username]
  delete ev.datastore.userLookup[ev.userId]

  ev.ws.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({
        type: 'userDisconnect',
        message: 'Someone disconnected',
        users: ev.datastore.userReady
      }))
    }
  })
  console.log(`${username} disconnected, dispatched message to all connections`)

  // if disconnect happens during countdown
  const countDownShouldStop = () => {
    let userReady = ev.datastore.userReady
    return (Object.keys(userReady).length < minRoomSize ||
            Object.values(userReady).includes(false))
  }

  if (ev.datastore.isCountingDown && countDownShouldStop()) {
    clearInterval(ev.datastore.countDownHandle)
    ev.datastore.countDownSec = countDownTime
    ev.emitter.emit('countDownStop', { ws: ev.ws })
  }

  // if disconnect happens at the end
  console.log(ev.ws.clients.size)
  // if everyone disconnected and we have data
  if (ev.ws.clients.size === 0 && ev.datastore.result !== undefined) {
    console.log('everyone disconnected, terminating script')
    process.exit(0)
  }
}
