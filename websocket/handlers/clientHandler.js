module.exports = (client, uid, ws, datastore) => {
  var eventEmitter = require('./eventEmitter')

  client.id = require('crypto').createHash('md5').update(`${uid}`).digest('hex')
  client.isAlive = true

  const buildEvent = (properties = {}) => {
    properties.client = client
    properties.userId = client.id
    properties.ws = ws
    properties.datastore = datastore
    return properties
  }

  client.on('pong', () => { eventEmitter.emit('pong', buildEvent()) })

  client.on('message', (raw) => {
    let msg = JSON.parse(raw)
    if (typeof (msg) !== 'object') {
      eventEmitter.emit('error', buildEvent({
        message: "message received but malformed, it has to be convertible to type 'object'"
      }))
    } else {
      console.log('received from "%s": [%s] %s', msg.name, msg.type, msg.message)

      switch (msg.type) {
        case 'register':
          eventEmitter.emit('newUser', buildEvent({
            message: 'new user register request',
            username: msg.name
          }))
          break

        case 'ready':
          eventEmitter.emit('readyStateChange', buildEvent({
            type: 'ready',
            message: 'user changed ready state to ready',
            emitter: eventEmitter // needed to trigger countdown start
          }))
          break

        case 'unready':
          eventEmitter.emit('readyStateChange', buildEvent({
            type: 'unready',
            message: 'user changed ready state to unready',
            emitter: eventEmitter // needed to trigger countdown stop
          }))
          break

        case 'submission':
          eventEmitter.emit('submission', buildEvent({
            message: 'user submitted form data',
            roundNum: msg.roundNum,
            data: msg.data
          }))
          break

        case 'confirmation':
          eventEmitter.emit('disconnectUser', buildEvent())
          break
      }
    }
  })

  client.on('close', () => {
    eventEmitter.emit('userDisconnected', buildEvent())
  })
}
