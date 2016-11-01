import Util from './util.js'

const Backdrop = (($) => {

  const OPEN_DURATION  = 600
  const CLOSE_DURATION = 150

  const container = $(document.body)

  class Backdrop {

    constructor() {
      this._backdropStack = []
    }

    open(animate, callback) {
      if (typeof animate === 'function') {
        callback = animate
        animate = false
      }
      const animation = animate ? 'fade' : ''
      const transition = Util.supportTransitionEnd() && animation

      this._element = $(`<div class="backdrop ${animation}"></div>`).appendTo(container)
      if (transition) Util.reflow(this._element[0])
      this._element.addClass('in')

      if (!callback) {
        return this
      }
      transition ?
        this._element.one(Util.transitionEnd())
          .emulateTransitionEnd(OPEN_DURATION, callback) :
        callback()
    }

    close(callback) {
      if (this._element) {
        this._element.removeClass('in')

        let removeCallback = () => {
          this._element && this._element.remove()
          this._element = null
          callback && callback()
        }

        if (!Util.supportTransitionEnd()) {
          return removeCallback()
        }

        this._element
          .one(Util.transitionEnd(), removeCallback)
          .emulateTransitionEnd(CLOSE_DURATION)
      }
    }
  }

  return Backdrop

})(Zepto || jQuery)

export default Backdrop