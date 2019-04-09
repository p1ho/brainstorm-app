'use strict'

module.exports = (ev) => {
  ev.datastore.userReady[ev.username] = false
  ev.datastore.userLookup[ev.userId] = ev.username

  ev.ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'newUser',
      message: 'New user connected to room',
      user: ev.username,
      users: ev.datastore.userReady
    }))
  })
}
