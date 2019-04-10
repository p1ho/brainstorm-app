'use strict'

module.exports = (data) => {
  var container = document.getElementById('app')
  container.innerHTML = `
  <p>
  You've reached the end! Thank you for using our tool.<br>
  Please see results below:
  </p>
  <ul></ul>
  `
  let ideaList = Object.values(data)
  ideaList.sort((a, b) => (a.count > b.count) ? 1: -1)

  let ul = container.querySelector('ul')
  for (let ideaObj of ideaList) {
    let li = document.createElement('li')
    li.innerHTML = `
    <span class="vote-count">(+${ideaObj.count})</span>
    <strong>${ideaObj.idea}</strong><br>
    <em>(inspired by "${ideaObj.origin}")</em>
    `
    ul.appendChild(li)
  }

}
