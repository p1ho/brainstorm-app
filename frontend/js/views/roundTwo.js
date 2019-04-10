'use strict'

const { getClock, setAttributes } = require('./utils')
const { minRoundTwo, numOfIdeas, seeSelf } = require('../settings')

module.exports = (data, ws) => {
  var container = document.getElementById('app')
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
      if (!(!seeSelf && ws.username === user)) {
        let li = document.createElement('li')
        setAttributes(li, {
          'data-id': data[user].roundOneIdeas[i].ideaId,
          'data-raw': data[user].roundOneIdeas[i].idea,
          'data-owner': data[user].roundOneIdeas[i].owner,
          'tabindex': 0
        })
        li.innerHTML = `<strong>${li.getAttribute('data-id')}</strong>: ${li.getAttribute('data-raw')}`
        ideaListUl.appendChild(li)
      }
    }
  })

  var newIdeaHtml = ''
  for (let i = 1; i < numOfIdeas + 1; i++) {
    newIdeaHtml += [
      `<label>Idea ${i}</label>`,
      `<input type="text" name="origin-${i}" size="1">`,
      `<input type="text" name="idea-${i}" disabled><br>`
    ].join('')
  }
  container.querySelector('.new-idea-container').innerHTML = newIdeaHtml

  let ideasOrigin = container.querySelectorAll('input[name^=origin]')
  ideasOrigin.forEach(node => {
    node.addEventListener('focus', e => {
      e.target.classList.add('highlight')
      ideaListUl.classList.add('highlight')
      Array.from(ideaListUl.children).forEach(child => { child.classList.add('cursor-ptr') })
    })

    node.addEventListener('blur', e => {
      e.target.classList.remove('highlight')
      ideaListUl.classList.remove('highlight')

      if (e.relatedTarget && e.relatedTarget.hasAttribute('data-id')) {
        e.target.value = e.relatedTarget.getAttribute('data-id')

        e.target.classList.add('selected')
        let inputNum = +e.target.getAttribute('name').replace('origin-', '')
        Array.from(ideaListUl.children).forEach(child => { child.classList.remove('cursor-ptr') })

        let newIdea = document.querySelector(`input[name=idea-${inputNum}]`)
        newIdea.disabled = false
        newIdea.focus()
      }
    })
  })

  container.prepend(getClock(minRoundTwo, () => {
    let processedData = []
    for (let i = 1; i < numOfIdeas + 1; i++) {
      let originDatum = document.querySelector(`input[name=origin-${i}]`)
      let ideaDatum = document.querySelector(`input[name=idea-${i}]`)

      let originLi = document.querySelector(`li[data-id="${originDatum.value}"]`)
      processedData.push({
        originId: originDatum.value,
        origin: originLi !== null ? originLi.getAttribute('data-raw') : '',
        originOwner: originLi !== null ? originLi.getAttribute('data-owner') : '',
        ideaId: `${originDatum.value}-${ws.userId.substring(0, 3)}-${i}`,
        idea: ideaDatum.value,
        owner: ws.username
      })
    }
    ws.send(JSON.stringify({
      name: ws.username,
      type: 'submission',
      message: 'Submitted form for round 2',
      roundNum: 2,
      data: processedData
    }))
  }))
}
