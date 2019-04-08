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
  if (['login', 'roundOne', 'roundTwo'].includes(state)) {
    setRoomView(container, data.users)
  } else if (state === 'vote') {
    setResultView(container, data.data)
    ws.close()
  } else if (state === 'room') {
    if (["newUser", "readyStateChange", "userDisconnect"].includes(data.type)) {
      setUsers(container, data.users)
    } else if (data.type === 'countDown') {
      container.querySelector('p').innerHTML = `Round Starting in ${data.timeLeft} seconds...`
    } else if (data.type === 'countDownStop') {
      container.querySelector('p').innerHTML = `Round will start when everyone is ready`
    } else if (data.type === 'roundStart') {
      switch (data.roundNum) {
        case 1:
          setRoundOneView(container)
        break
        case 2:
          setRoundTwoView(container, data.data)
        break
        case 3:
          setVoteView(container, data.data)
        break
      }
    } // else do nothing
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
      if (!users[name]) {
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
  <p>Round will start when everyone is ready</p>
  <button>Ready</button>
  `

  setUsers(container, users)

  var ready = container.querySelector('button')
  ready.onclick = () => {
    if (ready.innerHTML === 'Ready') {
      ws.send(JSON.stringify({
        name: username,
        type: "ready",
        message: "Ready for round start",
      }))
      ready.innerHTML = 'Unready'
      ready.classList.add('unready')
    } else {
      ws.send(JSON.stringify({
        name: username,
        type: "unready",
        message: "Unready for round start",
      }))
      ready.innerHTML = 'Ready'
      ready.classList.remove('unready')
    }
  }
}

function setRoundOneView(container) {
  container.setAttribute('data-state', 'roundOne')
  var html = `
  <p>
  Please put down ${numOfIdeas} ideas before time runs out.<br>
  If you have more than ${numOfIdeas} ideas, pick the ${numOfIdeas} best ones 😃
  </p>
  <form autocomplete="off">
  `
  for (let i = 1; i < numOfIdeas+1; i++) {
    html += `
    <label>Idea ${i}</label><input type="text" name="idea-${i}"><br>
    `
  }
  html += `</form>`

  container.innerHTML = html
  container.prepend(getClock(.1, container, () => {
    let formData = document.querySelectorAll("input[name^=idea]")
    ws.send(JSON.stringify({
      name: username,
      type: "submission",
      message: "Submitted form for round 1",
      roundNum: 1,
      data: Array.from(formData).map((input, i) => {
        return {
          ideaId: `${username}-${i}`,
          idea: input.value
        }
      })
    }))
  }))

}

function setRoundTwoView(container, data) {
  container.setAttribute('data-state', 'roundTwo')
  container.innerHTML = `
  <p>
  In this round, you can only work off of ideas from round 1.<br>
  Click on the small box, and select an idea from the list that inspired you,
  then type your new idea in the second input box.
  </p>
  <form autocomplete="off">
    <div class="idea-list-container"><ul></ul></div>
    <div class="new-idea-container"></div>
  </form>
  `

  let ideaListUl = container.querySelector('.idea-list-container ul')

  Object.keys(data).forEach(user => {
    for (let i in data[user].roundOneIdeas) {
      if (!(!seeSelf && username === user)) {
        let li = document.createElement('li')
        setAttributes(li, {
          'data-id': data[user].roundOneIdeas[i].ideaId,
          'data-raw': data[user].roundOneIdeas[i].idea,
          'tabindex': 0
        })
        li.innerHTML = `<strong>${li.getAttribute('data-id')}</strong>: ${li.getAttribute('data-raw')}`
        ideaListUl.appendChild(li)
      }
    }
  })

  var newIdeaHtml = []
  for (let i = 1; i < numOfIdeas + 1; i++) {
    newIdeaHtml.push(
      [
        `<label>Idea ${i}</label>`,
        `<input type="text" name="origin-${i}" size="1">`,
        `<input type="text" name="idea-${i}" disabled><br>`
      ].join('')
    )
  }
  container.querySelector('.new-idea-container').innerHTML = newIdeaHtml.join('')

  // add handling for origin idea inputs
  let ideasOrigin = container.querySelectorAll('input[name^=origin]')
  ideasOrigin.forEach(node => {
    node.addEventListener("focus", e => {
      e.target.classList.add('highlight')
      ideaListUl.classList.add('highlight')
      Array.from(ideaListUl.children).forEach(child => {child.classList.add('cursor-ptr')})
    })
    node.addEventListener("blur", e => {
      e.target.classList.remove('highlight')
      ideaListUl.classList.remove('highlight')

      if (e.relatedTarget && e.relatedTarget.hasAttribute('data-id')) {
        e.target.value = e.relatedTarget.getAttribute('data-id')

        e.target.style.backgroundColor = "#ccffcc"
        let inputNum = +e.target.getAttribute('name').replace("origin-", "")
        Array.from(ideaListUl.children).forEach(child => {child.classList.remove('cursor-ptr')})

        let newIdea = document.querySelector(`input[name=idea-${inputNum}]`)
        newIdea.disabled = false
        newIdea.focus()
      }
    })
  })

  container.prepend(getClock(.2, container, () => {
    let processedData = []
    for (let i = 1; i < numOfIdeas + 1; i++) {
      let originDatum = document.querySelector(`input[name=origin-${i}]`)
      let ideaDatum = document.querySelector(`input[name=idea-${i}]`)

      let originLi = document.querySelector(`li[data-id="${originDatum.value}"]`)
      processedData.push({
        originId: originDatum.value,
        origin: originLi !== null ? originLi.getAttribute('data-raw') : "",
        ideaId: `${originDatum.value}-${username}-${i}`,
        idea: ideaDatum.value
      })
    }
    ws.send(JSON.stringify({
      name: username,
      type: "submission",
      message: "Submitted form for round 2",
      roundNum: 2,
      data: processedData
    }))
  }))

}

function setVoteView(container, data) {
  container.setAttribute('data-state', 'vote')
  container.innerHTML = `
  <p>
  This is the voting round, you will vote for ideas that were generated only in the second round,
  You can only cast ${maxVote} votes.
  </p>
  <form autocomplete="off">
    <div class="vote-list-container"><ul></ul></div>
  </form>
  `

  let selected = {}
  let selectedTemp = []
  let voteListUl = container.querySelector('.vote-list-container ul')
  Object.keys(data).forEach(user => {
    for (let i in data[user].roundTwoIdeas) {
      if (!(!seeSelf && username === user)) {
        let li = document.createElement('li')
        li.classList.add('cursor-ptr')
        setAttributes(li, {
          'data-id': data[user].roundTwoIdeas[i].ideaId,
          'data-raw': data[user].roundTwoIdeas[i].idea,
          'tabindex': 0
        })
        li.innerHTML = `
        <strong>${li.getAttribute('data-raw')}</strong><br>
        <em>(inspired by "${data[user].roundTwoIdeas[i].origin}")</em>
        `

        selected[li.getAttribute('data-id')] = false

        const toggle = (e) => {
          let dataId = e.target.getAttribute('data-id')
          if (e.target.classList.contains('selected')) {
            e.target.classList.remove('selected')
            selected[dataId] = false
            selectedTemp.splice(selectedTemp.indexOf(dataId), 1)
          } else {
            e.target.classList.add('selected')
            selected[dataId] = true
            selectedTemp.push(dataId)
            if (selectedTemp.length > maxVote) {
              let dataIdToRemove = selectedTemp.shift()
              document.querySelector(`li[data-id=${dataIdToRemove}]`).classList.remove('selected')
              selected[dataIdToRemove] = false
            }
          }
        }

        li.addEventListener("click", toggle)
        li.addEventListener("keyup", (e) => {
          if (e.keyCode === 13) { toggle(e) }
        })

        voteListUl.appendChild(li)
      }
    }
  })

  container.prepend(getClock(.1, container, () => {
    ws.send(JSON.stringify({
      name: username,
      type: "submission",
      message: "Submitted form for vote round",
      roundNum: 3,
      data: selected
    }))
  }))
}

function setResultView(container, data) {
  container.setAttribute('data-state', 'result')
  container.innerHTML = "SHOW ME THE DATA"
  console.log(data)
}

function getClock(min, container, callback) {
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
      clearInterval(counter)
      callback()
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
