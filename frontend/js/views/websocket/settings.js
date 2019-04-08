var socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
var socketUrl = `${socketProtocol}//${window.location.hostname}:80`

module.exports = {
  socketProtocol: socketProtocol,
  socketUrl: socketUrl
}
