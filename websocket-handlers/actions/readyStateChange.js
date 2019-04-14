'use strict'

const { minRoomSize, countDownTime } = require('../../server.config')

module.exports = (ev) => {
  let username = ev.datastore.userLookup[ev.userId]
  let userReady = ev.datastore.userReady

  const notifyClient = () => {
    ev.ws.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'readyStateChange',
        message: `Someone changed ready state to ${ev.type}`,
        user: username,
        users: ev.datastore.userReady
      }))
    })
  }

  userReady[username] = (ev.type === 'ready')
  notifyClient()
  console.log(JSON.stringify(userReady, null, 4))

  const allReady = () => {
    return (ev.type === 'ready' &&
            Object.keys(userReady).length >= minRoomSize &&
            !Object.values(userReady).includes(false))
  }

  if (allReady()) {
    ev.datastore.countDownSec = countDownTime
    ev.datastore.countDownHandle = setInterval(() => {
      let sec = ev.datastore.countDownSec
      if (sec !== 0) {
        console.log(`Counting Down: ${sec} seconds left.`)
      } else {
        console.log('Countdown Complete, Round Starting!')
        clearInterval(ev.datastore.countDownHandle)
        ev.datastore.countDownSec = countDownTime
      }
      ev.emitter.emit('countDown', {
        ws: ev.ws,
        datastore: ev.datastore,
        timeLeft: sec
      })
      ev.datastore.countDownSec--
    }, 1000)
  } else {
    clearInterval(ev.datastore.countDownHandle)
    ev.datastore.countDownSec = countDownTime
    ev.emitter.emit('countDownStop', { ws: ev.ws })
  }
}
