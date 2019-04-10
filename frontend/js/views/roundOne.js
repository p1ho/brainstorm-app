'use strict'

const { getClock } = require('./utils')
const { minRoundOne, numOfIdeas } = require('../../../client.config')

module.exports = (ws) => {
  var container = document.getElementById('app')
  container.innerHTML = `
  <p>
  Please put down ${numOfIdeas} ideas before time runs out.<br>
  If you have more than ${numOfIdeas} ideas, pick the ${numOfIdeas} best ones 😃
  </p>
  <form autocomplete="off"></form>
  `

  var form = container.querySelector('form')
  for (let i = 1; i < numOfIdeas + 1; i++) {
    form.innerHTML += `
    <label>Idea ${i}</label><input type="text" name="idea-${i}"><br>
    `
  }

  container.prepend(getClock(minRoundOne, () => {
    let formData = form.querySelectorAll('input[name^=idea]')
    ws.send(JSON.stringify({
      name: ws.username,
      type: 'submission',
      message: 'Submitted form for round 1',
      roundNum: 1,
      data: Array.from(formData).map((input, i) => {
        return {
          ideaId: `${ws.userId.substring(0, 3)}-${i}`,
          idea: input.value,
          owner: ws.username
        }
      })
    }))
  }))
}
