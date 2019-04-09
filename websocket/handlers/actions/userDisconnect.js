'use strict'

const { minRoomSize, countDownTime } = require('../../settings')

module.exports = (ev) => {
  let username = ev.datastore.userLookup[ev.userId]
  delete ev.datastore.userReady[username]
  delete ev.datastore.userLookup[ev.userId]
  console.log(`${username} disconnected`)
  ev.ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'userDisconnect',
      message: 'Someone disconnected',
      users: ev.datastore.userReady
    }))
  })

  const countDownShouldStop = () => {
    let userReady = ev.datastore.userReady
    return (Object.keys(userReady).length < minRoomSize ||
            Object.values(userReady).includes(false))
  }

  if (countDownShouldStop()) {
    clearInterval(ev.datastore.countDownHandle)
    ev.datastore.countDownSec = countDownTime
    ev.emitter.emit('countDownStop', { ws: ev.ws })
  }
}
