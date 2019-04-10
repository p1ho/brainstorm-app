'use strict'

const fs = require('fs')
const path = require('path')

module.exports = (ev) => {
  let userData = ev.datastore.userData

  // show summary
  console.log('=============================================')
  console.log('Summary')

  var fixationScoreGroupTotal = 0
  Object.keys(userData).forEach(username => {
    console.log('---------------------------------------------')
    console.log(`${username}'s data:`)
    let fixationScoreTotal = 0
    Object.keys(userData[username].roundVote).forEach(ideaId => {
      if (userData[username].roundVote[ideaId]) {
        console.log(`voted for ${ideaId}:`)
        let ideaObj = ev.datastore.ideaLookup[ideaId]
        console.log(ideaObj)
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

  // save data to output folder
  let outputPath = path.resolve(`${__dirname}/../../../output/`)
  let outputName = `${new Date().toISOString().substring(0, 19).replace(/[\:\-\_]/gi, '')}.json`
  let json = JSON.stringify(userData)
  console.log(`Saving data to: ${outputPath}/${outputName}`)

  // create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath)
  }

  // initiate write file
  fs.writeFile(`${outputPath}/${outputName}`, json, 'utf8', (err) => {
    if (err) { throw err }
    console.log('Data Saved!')
    console.log('=============================================')
    console.log('Exiting, have a good day!')
    process.exit(0)
  })
}
