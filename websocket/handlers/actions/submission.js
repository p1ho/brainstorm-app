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
      // handle vote result from user
      ev.client.send(JSON.stringify({
        type: 'over',
        message: 'The session is over, sending final results. Please return a confirmation',
        data: ['some-final-results']
      }))
      break
  }
}
