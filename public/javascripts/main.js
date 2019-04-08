// test variables
var seeSelf = false // false for design-fixation prevention mode, true for unaltered
var numOfIdeas = 3
var maxVote = 3


const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
const socketUrl = socketProtocol + '//' + window.location.hostname + ':80'
var ws
var username

window.onload = () => {
  setLoginView(document.getElementById('app'))
}

window.onbeforeunload = () => {
  if (ws !== undefined) {
    ws.close()
  }
}
