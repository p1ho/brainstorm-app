'use strict'

module.exports = (ev) => {
  console.log(ev.data)
  var username = ev.datastore.userLookup[ev.userId]

  switch (ev.roundNum) {
    case 1:
      ev.datastore.userData[username] = {
        roundOneIdeas: ev.data
      }
      ev.client.send(JSON.stringify({
        type: 'success',
        message: 'Your form was successfully submitted and recorded',
        users: ev.datastore.userReady
      }))
      break

    case 2:
      ev.datastore.userData[username].roundTwoIdeas = ev.data
      ev.client.send(JSON.stringify({
        type: 'success',
        message: 'Your form was successfully submitted and recorded',
        users: ev.datastore.userReady
      }))
      break

    case 3:
      ev.datastore.userData[username].roundVote = ev.data

      // emit data collection complete when all users have data in roundVote
      let usersAll = Object.keys(ev.datastore.userReady)
      let collectionComplete = true
      for (let user of usersAll) {
        if (!ev.datastore.userData[user].hasOwnProperty('roundVote')) {
          collectionComplete = false
          break
        }
      }
      if (collectionComplete) {
        ev.emitter.emit('collectionComplete', {
          ws: ev.ws,
          datastore: ev.datastore
        })
      }
      break
  }
}
