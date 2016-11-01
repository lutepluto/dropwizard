const Util = (($) => {

  let transition = false

  const TransitionEndEvent = {
    WebkitTransition : 'webkitTransitionEnd',
    MozTransition    : 'transitionEnd',
    OTransition      : 'oTransitionEnd otransitionend',
    transition       : 'transitionend'
  }

  function transitionEndTest() {
    let el = document.createElement('fancy')

    for (let name in TransitionEndEvent) {
      if (el.style[name] !== undefined) {
        return { end: TransitionEndEvent[name] }
      }
    }
    return false
  }

  function transitionEndEmulator(duration) {
    let called = false

    $(this).one(transition.end, () => {
      called = true
    })

    setTimeout(() => {
      if (!called) {
        Util.triggerTransitionEnd(this)
      }
    }, duration)
  }

  function setTransitionEndSupport() {
    transition = transitionEndTest()
    $.fn.emulateTransitionEnd = transitionEndEmulator
  }

  let Util = {

    transitionEnd() {
      return transition.end
    },

    reflow(element) {
      new Function('fa', 'return fa')(element.offsetHeight)
    },

    supportTransitionEnd() {
      return Boolean(transition)
    },

    triggerTransitionEnd(element) {
      $(element).trigger(transition.end)
    }
  }

  setTransitionEndSupport()

  return Util

})(Zepto || jQuery)

export default Util
