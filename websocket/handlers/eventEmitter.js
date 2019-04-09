var events = require('events')
var eventEmitter = new events.EventEmitter()

eventEmitter.on('pong', require('./actions/pong'))
eventEmitter.on('error', require('./actions/error'))
eventEmitter.on('newUser', require('./actions/newUser'))
eventEmitter.on('readyStateChange', require('./actions/readyStateChange'))
eventEmitter.on('submission', require('./actions/submission'))
eventEmitter.on('countDown', require('./actions/countDown'))
eventEmitter.on('countDownStop', require('./actions/countDownStop'))
eventEmitter.on('userDisconnect', require('./actions/userDisconnect'))
eventEmitter.on('disconnectUser', require('./actions/disconnectUser'))

module.exports = eventEmitter
