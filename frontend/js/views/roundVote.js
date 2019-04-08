const { getClock, setAttributes } = require('./utils')
const { minPerRound, numOfIdeas } = require('../settings')

module.exports = (data, ws) => {
  var container = document.getElementById('app')
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
      if (!(!seeSelf && ws.username === user)) {
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
              document.querySelector(`li[data-id="${dataIdToRemove}"]`).classList.remove('selected')
              selected[dataIdToRemove] = false
            }
          }
        }

        li.addEventListener('click', toggle)
        li.addEventListener('keyup', (e) => {
          if (e.keyCode === 13) { toggle(e) }
        })

        voteListUl.appendChild(li)
      }
    }
  })

  container.prepend(getClock(minPerRound, container, () => {
    ws.send(JSON.stringify({
      name: ws.username,
      type: 'submission',
      message: 'Submitted form for vote round',
      roundNum: 3,
      data: selected
    }))
  }))
}
