const getTimeString = (sec) => {
  var m = Math.floor(sec / 60)
  var s = sec % 60
  mStr = m >= 10 ? m : '0' + m
  sStr = s >= 10 ? s : '0' + s
  return mStr + ':' + sStr
}

module.exports.getClock = (minute, callback) => {
  var clock = document.createElement('div')
  clock.classList.add('clock')

  var totalSeconds = min * 60
  clock.innerHTML = getTimeString(totalSeconds)

  const countdown = () => {
    totalSeconds -= 1
    clock.innerHTML = getTimeString(totalSeconds)
    if (totalSeconds <= 0) {
      clearInterval(counter)
      callback()
    }
  }

  var counter = setInterval(countdown, 1000)

  return clock
}

module.exports.setAttributes = (el, attributes) => {
  for (let key in attributes) {
    el.setAttribute(key, attributes[key])
  }
}
