const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:');
const socketUrl = socketProtocol + '//' + window.location.hostname + ':80';
const ws = new WebSocket(socketUrl, ['json']);

ws.addEventListener('open', () => {
  const data = { message: 'Hello from the client!' }
  const json = JSON.stringify(data);
  ws.send(json);
})

ws.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  console.log(data);
})
