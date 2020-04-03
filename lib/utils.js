exports.pick = (obj, keys = []) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)))
}

exports.omit = (obj, keys = []) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)))
}

exports.debounce = (fn, time) => {
  let timeout

  return function () {
    const functionCall = () => fn.apply(this, arguments)

    clearTimeout(timeout)
    timeout = setTimeout(functionCall, time)
  }
}
