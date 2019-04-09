'use strict'

const setUsers = (users) => {
  var container = document.getElementById('app')
  var connected = container.querySelector('.connected')
  connected.innerHTML = ''

  for (let name in users) {
    if (users.hasOwnProperty(name)) {
      let avatar = document.createElement('div')
      avatar.innerHTML = name
      if (!users[name]) {
        avatar.classList.add('unready')
      }
      connected.appendChild(avatar)
    }
  }
}

module.exports.viewRoom = (users, ws) => {
  var container = document.getElementById('app')
  container.innerHTML = `
  <h2>Connected</h2>
  <div class="connected"></div>
  <p>Round will start when everyone is ready</p>
  <form><input type="submit" value="Ready"></form>
  `
  setUsers(users)

  var form = container.querySelector('form')
  var ready = form.querySelector('input[type="submit"]')

  form.onsubmit = () => {
    if (ready.value === 'Ready') {
      ws.send(JSON.stringify({
        name: ws.username,
        type: 'ready',
        message: 'Ready for round start'
      }))
      ready.value = 'Unready'
      ready.classList.add('unready')
    } else {
      ws.send(JSON.stringify({
        name: ws.username,
        type: 'unready',
        message: 'Unready for round start'
      }))
      ready.value = 'Ready'
      ready.classList.remove('unready')
    }
    return false
  }

  ready.focus()
}

module.exports.setUsers = setUsers
