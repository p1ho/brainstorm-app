module.exports = (ev) => {
  if (ev.timeLeft > 0) {
    ev.ws.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'countDown',
        message: 'Counting down before round starts',
        timeLeft: ev.timeLeft
      }))
    })
  } else {
    // round starts, reset everyone's ready status to false
    let userReady = ev.datastore.userReady
    Object.keys(userReady).forEach(user => {
      userReady[user] = false
    })
    var formData
    switch (ev.datastore.roundNum) {
      case 1:
        formData = []
        break
      case 2:
        formData = ev.datastore.userData
        break
      case 3:
        formData = ev.datastore.userData
        break
    }
    ev.ws.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'roundStart',
        message: 'Starting round',
        roundNum: ev.datastore.roundNum,
        data: formData
      }))
    })
    ev.datastore.roundNum++
  }
}
