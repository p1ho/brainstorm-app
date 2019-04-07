function heartbeat() {
  clearTimeout(this.pingTimeout)
  this.pingTimeout = setTimeout(() => {
    this.terminate()
  }, 15000 + 1000)
}

function wsMessageHandler(e) {
  var data = JSON.parse(e.data)
  console.log(data)
  var container = document.getElementById('app')
  var state = container.getAttribute('data-state')
  switch (state){
    case 'login':
      container.innerHTML = ""
      setRoomView(container, data.users)
    break

    case 'room':
      if (["newUser", "readyStateChange", "userDisconnect"].includes(data.type)) {
        setUsers(container, data.users)
      } else if (data.type === 'roundStart') {
        console.log('handle next view')
      }

    break
  }
}

function setLoginView(container) {
  container.setAttribute('data-state', 'login')
  container.innerHTML = `
  <form autocomplete="off">
    <label>Enter Name</label><br>
    <input type="text" name="name"><br>
    <input type="submit" value="Connect">
  </form>
  `
  var form = container.querySelector('form')
  var name = container.querySelector('input[name=name]')

  form.onsubmit = () => {
    ws = new WebSocket(socketUrl, ['json'])
    username = name.value

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        name: username,
        type: "register",
        message: `Register name request (${username})`,
      }))
    })
    ws.addEventListener('message', wsMessageHandler)

    ws.addEventListener('ping', () => {
      console.log('pinged')
    })
    ws.addEventListener('close', function clear() {
      clearTimeout(this.pingTimeout)
    })

    return false
  }
}

function setUsers(container, users) {
  var connected = container.querySelector('.connected')
  connected.innerHTML = ""

  for (let name in users) {
    if (users.hasOwnProperty(name)) {
      let avatar = document.createElement('div')
      avatar.innerHTML = name
      if (!users[name].ready) {
        avatar.classList.add('unready')
      }
      connected.appendChild(avatar)
    }
  }
}

function setRoomView(container, users) {
  container.setAttribute('data-state', 'room')
  container.innerHTML = `
  <h2>Connected</h2>
  <div class="connected"></div>
  <button>Ready</button>
  `

  setUsers(container, users)

  var ready = container.querySelector('button')
  ready.onclick = () => {
    if (ready.innerHTML === 'Ready') {
      ws.send(JSON.stringify({
        name: username,
        type: "ready",
        message: "Ready for round 1",
      }))
      ready.innerHTML = 'Unready'
      ready.classList.add('unready')
    } else {
      ws.send(JSON.stringify({
        name: username,
        type: "unready",
        message: "Unready for round 1",
      }))
      ready.innerHTML = 'Ready'
      ready.classList.remove('unready')
    }
  }
}

function getRoundOneView(container) {
  var numOfIdeas = 3
  var container = document.createElement('section')
  container.id = 'app'
  container.setAttribute('data-state', 'roundOne')
  var html = '<form autocomplete="off">'
  for (let i = 1; i < numOfIdeas+1; i++) {
    html += `
    <label>Idea ${i}</label><input type="text" name="idea-${i}"><br>
    `
  }
  html += `</form>`

  container.innerHTML = html
  container.prepend(getClock(.2, container))
  return container
}

function getRoundTwoView(container) {
  var container = document.createElement('section')
  container.id = 'app'
  container.setAttribute('data-state', 'roundTwo')
  container.innerHTML = `
  <form autocomplete="off">
    <div class="idea-list-container">
    <select id="idea-list" size="5">
      <option value="1">One</option>
      <option value="2">Two</option>
      <option value="3">Three</option>
      <option value="4">Four</option>
    </select>
    </div>
    <div class="new-idea-container">
    <label>Idea 1</label><input type="text" name="origin-1" size="1"><input type="text" name="idea-1" disabled><br>
    <label>Idea 2</label><input type="text" name="origin-2" size="1"><input type="text" name="idea-2" disabled><br>
    <label>Idea 3</label><input type="text" name="origin-3" size="1"><input type="text" name="idea-3" disabled><br>
    </div>
  </form>
  `
  container.prepend(getClock(.2, container))
  return container
}

function getVoteView(container) {
  var container = document.createElement('section')
  container.id = 'app'
  container.setAttribute('data-state', 'vote')
  container.innerHTML = `
  <form autocomplete="off">
    <div class="vote-list-container">
    <select id="vote-list" size="5">
      <option value="1">One</option>
      <option value="2">Two</option>
      <option value="3">Three</option>
      <option value="4">Four</option>
    </select>
    </div>
  </form>
  `
  container.prepend(getClock(.2, container))
  return container
}

function getResultView(container) {

}

function getClock(min, container) {
  const getTimeString = (sec) => {
    var m = Math.floor(sec / 60)
    var s = sec % 60
    mStr = m >= 10 ? m : '0' + m
    sStr = s >= 10 ? s : '0' + s
    return mStr+':'+sStr
  }

  var clock = document.createElement('div')
  clock.classList.add('clock')

  var totalSeconds = min * 60
  clock.innerHTML = getTimeString(totalSeconds)

  const countdown = () => {
    totalSeconds -= 1
    clock.innerHTML = getTimeString(totalSeconds)
    if (totalSeconds <= 0) {
      console.log(container)
      clearInterval(counter)
    }
  }

  var counter = setInterval(countdown, 1000)

  return clock
}

function setAttributes(el, attrs) {
  for (let key in attrs) {
    el.setAttribute(key, attrs[key])
  }
}
