'use strict'

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
}
