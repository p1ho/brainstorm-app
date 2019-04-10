'use strict'

module.exports = (ev) => {
  // tally vote results
  let userData = ev.datastore.userData

  let ideaLookup = {}
  Object.keys(userData).forEach(username => {
    userData[username].roundTwoIdeas.forEach(idea => {
      ideaLookup[idea.ideaId] = idea
    })
  })
  ev.datastore.ideaLookup = ideaLookup

  let tally = {}
  Object.keys(userData).forEach(username => {
    Object.keys(userData[username].roundVote).forEach(ideaId => {
      if (userData[username].roundVote[ideaId]) {
        if (tally.hasOwnProperty(ideaId)) {
          tally[ideaId].count++
        } else {
          tally[ideaId] = { ...ideaLookup[ideaId] }
          tally[ideaId].count = 1
        }
      }
    })
  })
  ev.datastore.result = tally

  // notify clients
  ev.ws.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'over',
      message: 'The session is over, sending final results. Please return a confirmation',
      data: tally
    }))
  })
}
