const { viewRoom, setUsers } = require('../room')
const viewRoundOne = require('../roundOne')
const viewRoundTwo = require('../roundTwo')
const viewRoundVote = require('../roundVote')
const viewResult = require('../result')

module.exports = (event) => {
  var data = JSON.parse(event.data)
  var ws = event.srcElement
  console.log(data)

  var container = document.getElementById('app')
  var state = container.getAttribute('data-state')

  if (['login', 'roundOne', 'roundTwo'].includes(state)) {
    if (state === 'login') { ws.userId = data.userId }
    container.setAttribute('data-state', 'room')
    viewRoom(data.users, ws)
  } else if (state === 'room') {
    if (['newUser', 'readyStateChange', 'userDisconnect'].includes(data.type)) {
      setUsers(data.users)
    } else if (data.type === 'countDown') {
      container.querySelector('p').innerHTML = `Round Starting in ${data.timeLeft} seconds...`
    } else if (data.type === 'countDownStop') {
      container.querySelector('p').innerHTML = `Round will start when everyone is ready`
    } else if (data.type === 'roundStart') {
      switch (data.roundNum) {
        case 1:
          container.setAttribute('data-state', 'roundOne')
          viewRoundOne(ws)
          break
        case 2:
          container.setAttribute('data-state', 'roundTwo')
          viewRoundTwo(data.data, ws)
          break
        case 3:
          container.setAttribute('data-state', 'roundVote')
          viewRoundVote(data.data, ws)
          break
      }
    } // else do nothing
  } else if (state === 'roundVote') {
    container.setAttribute('data-state', 'result')
    viewResult(data.data)
    if (data.type === 'over') {
      ws.send(JSON.stringify({
        name: ws.username,
        type: 'confirmation',
        message: 'received result, free to terminate'
      }))
    }
  }
}
