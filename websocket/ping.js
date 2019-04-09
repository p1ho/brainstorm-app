const { pingInterval } = require('./settings')

module.exports = (ws, datastore) => {
  var hasDropped = false
  return setInterval(function ping () {
    ws.clients.forEach(function each (client) {
      if (client.isAlive === false) {
        hasDropped = true
        let username = datastore.userLookup[client.id]
        delete datastore.userLookup[client.id]
        delete datastore.userReady[username]
        return client.terminate()
      }
      client.isAlive = false
      client.ping(function noop () {})
    })
    if (hasDropped) {
      console.log('Someone dropped, notifying all other clients')
      ws.clients.forEach(function each (client) {
        client.send(JSON.stringify({
          type: 'userDisconnect',
          message: 'Someone disconnected',
          users: datastore.userReady
        }))
      })
    }
  }, pingInterval)
}
