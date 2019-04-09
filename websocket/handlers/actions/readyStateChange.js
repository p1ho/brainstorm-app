const { roomSize, countDownTime } = require('../../settings')

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

  var countDown // storing setInterval()

  userReady[username] = (ev.type === 'ready')
  notifyClient()
  console.log(userReady)

  if (ev.type === 'ready') {
    if (Object.keys(userReady).length === roomSize) {
      let allReady = true
      for (let ready of Object.values(userReady)) {
        if (!ready) {
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
          ev.emitter.emit('countDown', {
            ws: ev.ws,
            datastore: ev.datastore,
            timeLeft: sec
          })
          sec--
        }, 1000)
      }
    }
  } else {
    if (countDown) {
      clearInterval(countDown)
      ev.emitter.emit('countDownStop', { ws: ev.ws })
    }
  }
}
