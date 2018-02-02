function hasClass (el, name) {
  let exp = new RegExp('(^|\\s)' + name + '(\\s|$)')
  return exp.test(el.className)
}
function addClass (el, name) {
  if (hasClass(el, name)) {
    return false
  } else {
    let newClass = el.className.split(' ')
    newClass.push(name)
    el.className = newClass.join(' ')
  }
}
function removeClass (el, name) {
  if (!hasClass(el, name)) {
    return true
  } else {
    let newClass = el.className.split(' ')
    newClass.splice(newClass.indexOf(name), 1)
    el.className = newClass.join(' ')
  }
}
function client () {
  if (window.innerHeight !== undefined) {
    return {
      'width': window.innerWidth,
      'height': window.innerHeight
    }
  } else if (document.compatMode === 'CSS1Compat') {
    return {
      'width': document.documentElement.clientWidth,
      'height': document.documentElement.clientHeight
    }
  } else {
    return {
      'width': document.body.clientWidth,
      'height': document.body.clientHeight
    }
  }
}

export {
  hasClass,
  addClass,
  removeClass,
  client
}
