module.exports = (ev) => {
  console.log(`disconnecting ${ev.datastore.userLookup[ev.userId]}`)
  ev.client.close()
}
