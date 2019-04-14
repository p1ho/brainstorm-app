'use strict'

const fs = require('fs')
const path = require('path')

const analyze = (name) => {
  const pathToFile = `./output/${name}.json`

  if (!fs.existsSync(pathToFile)) {
    console.log(`file ${pathToFile} not found!`)
    process.exit(1)
  }

  var userData = JSON.parse(fs.readFileSync(pathToFile, 'utf-8').toString())

  console.log('=============================================')
  console.log(`Summary for ${name}.json`)

  var ideaLookup = {}
  Object.keys(userData).forEach(username => {
    userData[username].roundTwoIdeas.forEach(idea => {
      ideaLookup[idea.ideaId] = idea
    })
  })

  var fixationScoreGroupTotal = 0
  Object.keys(userData).forEach(username => {
    console.log('---------------------------------------------')
    console.log(`${username}'s data:`)
    let fixationScoreTotal = 0
    Object.keys(userData[username].roundVote).forEach(ideaId => {
      if (userData[username].roundVote[ideaId]) {
        console.log(`voted for ${ideaId}:`)
        let ideaObj = ideaLookup[ideaId]
        console.log(JSON.stringify(ideaObj, null, 4))
        let fixationScore = 0
        if (ideaObj.originOwner === username) {
          fixationScore++
          console.log('(+1) Is owner of idea that inspired this idea.')
        }
        if (ideaObj.owner === username) {
          fixationScore++
          console.log('(+1) Is owner of idea.')
        }
        fixationScoreTotal += fixationScore
      }
    })
    console.log(`${username}'s total fixation score was ${fixationScoreTotal}`)
    fixationScoreGroupTotal += fixationScoreTotal
  })
  console.log('---------------------------------------------')
  console.log(`Group total fixation score: ${fixationScoreGroupTotal}`)
  console.log(`Group mean fixation score: ${fixationScoreGroupTotal / Object.keys(userData).length}`)
  console.log('=============================================')
}

if (require.main === module) {
  analyze(process.argv[2])
} else {
  module.exports = analyze
}
