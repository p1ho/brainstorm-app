'use strict'

const fs = require('fs')
const path = require('path')
const analyze = require('../../analysis')

module.exports = (ev) => {
  let userData = ev.datastore.userData

  // save data to output folder
  let outputPath = path.resolve(`${__dirname}/../../output/`)
  let outputName = `${new Date().toISOString().substring(0, 19).replace(/[:\-_]/gi, '')}`
  let json = JSON.stringify(userData)
  console.log(`Saving data to: ${outputPath}/${outputName}.json`)

  // create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath)
  }

  // initiate write file
  fs.writeFile(`${outputPath}/${outputName}.json`, json, 'utf8', (err) => {
    if (err) { throw err }
    console.log('Data Saved!')

    // print summary
    analyze(outputName)

    console.log('Exiting, have a good day!')
    process.exit(0)
  })
}
