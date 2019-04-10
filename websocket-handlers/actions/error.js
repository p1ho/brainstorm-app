'use strict'

module.exports = (ev) => {
  ev.client.send(JSON.stringify({
    type: 'error',
    message: ev.message
  }))
}
