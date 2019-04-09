'use strict'

const wsSettings = require('./websocket/settings')
const wsMessageHandler = require('./websocket/messageHandler')

module.exports = () => {
  var container = document.getElementById('app')
  container.setAttribute('data-state', 'login')
  container.innerHTML = `
    <form autocomplete="off">
      <label>Enter Name</label><br>
      <input type="text" name="name"><br>
      <input type="submit" value="Connect">
    </form>
  `

  var form = container.querySelector('form')
  var name = form.querySelector('input[name="name"]')

  form.onsubmit = () => {
    var ws = new WebSocket(wsSettings.socketUrl, ['json'])

    ws.username = name.value
    ws.onopen = () => {
      ws.send(JSON.stringify({
        name: ws.username,
        type: 'register',
        message: `Register name request (${ws.username})`
      }))
    }
    ws.onclose = () => { console.log('closing websocket connection') }
    ws.onmessage = wsMessageHandler

    window.onbeforeunload = () => {
      ws.close()
    }

    // in case ping is implemented by browser
    ws.addEventListener('ping', () => { console.log('pinged by server') })

    return false
  }
}
