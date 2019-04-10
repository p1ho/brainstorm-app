'use strict'

const { getClock, setAttributes } = require('./utils')
const { minRoundVote, maxVote, seeSelf } = require('../settings')

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
    for (let ideaObj of data[user].roundTwoIdeas) {
      let ideaId = ideaObj.ideaId
      let idea = ideaObj.idea
      selected[ideaId] = false

      if (!(!seeSelf && ws.username === user)) {
        let li = document.createElement('li')
        li.classList.add('cursor-ptr')
        setAttributes(li, {
          'data-id': ideaId,
          'data-raw': idea,
          'tabindex': 0
        })
        li.innerHTML = `
        <strong>${idea}</strong><br>
        <em>(inspired by "${ideaObj.origin}")</em>
        `

        const toggle = (e) => {
          let targetLi = e.target.closest('li')
          if (!targetLi) { return }

          let dataId = targetLi.getAttribute('data-id')
          if (targetLi.classList.contains('selected')) {
            targetLi.classList.remove('selected')
            selected[dataId] = false
            selectedTemp.splice(selectedTemp.indexOf(dataId), 1)
          } else {
            targetLi.classList.add('selected')
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

  container.prepend(getClock(minRoundVote, () => {
    ws.send(JSON.stringify({
      name: ws.username,
      type: 'submission',
      message: 'Submitted form for vote round',
      roundNum: 3,
      data: selected
    }))
  }))
}
