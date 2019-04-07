const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
const socketUrl = socketProtocol + '//' + window.location.hostname + ':80'
var ws
var username

window.onload = () => {
  var container = document.createElement('section')
  container.id = 'app'
  document.body.appendChild(container)

  setLoginView(container)
}

window.onbeforeunload = () => {
  if (ws !== undefined) {
    ws.close()
  }
}
