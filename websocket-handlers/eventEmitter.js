'use strict'

var events = require('events')
var eventEmitter = new events.EventEmitter()

var eventList = [
  'pong',
  'error',
  'newUser',
  'readyStateChange',
  'submission',
  'countDown',
  'countDownStop',
  'collectionComplete',
  'userDisconnect',
  'disconnectUser',
  'shutdownServer'
]

for (let eventname of eventList) {
  eventEmitter.on(eventname, require(`./actions/${eventname}`))
}

module.exports = eventEmitter
