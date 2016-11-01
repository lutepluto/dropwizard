import Util from './util.js'

(($) => {

  const NAME      = 'DROPWIZARD'
  const SEPERATOR = $.zepto ? ':' : '.'
  const DATA_KEY  = `fancy${SEPERATOR}dropwizard`
  const EVENT_KEY = `${DATA_KEY}`

  const BACKDROP_TRANSITION_DURATION = 600

  const Selector = {
    DATA_TOGGLE : '[data-toggle="dropwizard"]',
    DATA_MENU   : '[data-drop-menu]',
    DATA_DIRECT : '[data-direct]',
    DATA_VALUE  : '[data-value]'
  }

  const Event = {
    TOGGLE   : `click.toggle.${EVENT_KEY}`,
    DIRECT   : `click.direct.${EVENT_KEY}`,
    SELECT   : `click.select.${EVENT_KEY}`,
    SHOW     : `show${SEPERATOR}${EVENT_KEY}`,
    SHOWN    : `shown${SEPERATOR}${EVENT_KEY}`,
    HIDE     : `hide${SEPERATOR}${EVENT_KEY}`,
    HIDDEN   : `hidden${SEPERATOR}${EVENT_KEY}`,
    SELECTED : `selected${SEPERATOR}${EVENT_KEY}`
  }

  const ClassName = {
    MENU     : '.menu',
    SUB_MENU : '.menu.sub'
  }

  const container = $(document.body)

  class Dropwizard {

    constructor(element, options) {
      this._element = $(element)
      this._options = options
      this._wizards = this._element.find(Selector.DATA_TOGGLE)
      this._menus = this._element.find(Selector.DATA_MENU)
      this._backdrop = null

      this._isTransitioning = false
      this._isOpened = false
      this._isSwitching = false
      
      this._element.on(Event.TOGGLE, Selector.DATA_TOGGLE, $.proxy(this.toggle, this))
      this._element.on(Event.DIRECT, Selector.DATA_DIRECT, $.proxy(this._direct, this))
      this._element.on(Event.SELECT, Selector.DATA_VALUE, $.proxy(this._select, this))
    }

    static get Default() {}

    toggle(event) {
      event.preventDefault()
      let wizard = $(event.currentTarget)
      let isWizardActive = this._isActive(wizard)

      if (!isWizardActive && this._isOpened) {
        this._isSwitching = true
      }
      isWizardActive ? this._hide(wizard) : this._show(wizard)
      this._isSwitching = false
    }

    _show(wizard) {
      if (this._isTransitioning) {
        return
      }

      let e = $.Event(Event.SHOW, { relatedTarget: wizard[0] })
      this._element.trigger(e)
      if (e.isDefaultPrevented()) {
        return
      }

      let activeWizard = this._getActive()
      if (activeWizard.length) {
        this._hide(activeWizard)
      }

      this._isOpened = true
      this._isTransitioning = true

      let complete = () => {
        wizard.addClass('active')
        let activeMenu = this._getTargetMenu(wizard)
        this._layoutMenu(activeMenu)
        activeMenu.addClass('active')

        this._isTransitioning = false
        this._element.trigger($.Event(Event.SHOWN, { relatedTarget: wizard[0] }))
      }

      if (this._isSwitching) {
        return complete()
      }
      this._toggleBackdrop(complete)
    }

    _hide(wizard) {
      if (this._isTransitioning) {
        return
      }

      const e = $.Event(Event.HIDDEN, { relatedTarget: wizard[0] })
      this._element.trigger(e)
      if (e.isDefaultPrevented()) {
        return
      }

      if (!this._isSwitching) {
        this._isOpened = false
      }
      this._isTransitioning = true

      wizard.removeClass('active')
      this._getTargetMenu(wizard).removeClass('active')

      let complete = () => {
        this._isTransitioning = false
        this._element.trigger($.Event(Event.HIDDEN, { relatedTarget: wizard[0] }))
      }

      if (this._isSwitching) {
        return complete()
      }
      this._toggleBackdrop(complete)
    }

    _direct(event) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      let $direct = $(event.currentTarget)
      let $target = $($direct.data('direct'))

      let $menu = $direct.parents(ClassName.MENU)
      let $activeItem = $menu.find('.active')
      if ($activeItem.length) {
        $activeItem.removeClass('active')
        $($activeItem.children(Selector.DATA_DIRECT).data('direct')).removeClass('active')
      }

      $direct.parent().addClass('active')
      $target.addClass('active')
    }

    _select(event) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      let $target = $(event.currentTarget)
      if ($target.hasClass('active')) {
        return
      }

      // let e = $.Event(Event.SELECT, { relatedTarget: $target[0] })
      // this._element.trigger(e)
      // if (e.isDefaultPrevented()) {
      //   return
      // }

      let $targetMenu = $target.parents(Selector.DATA_MENU)
      // let preActive = $targetMenu.data('prev-active')
      // if (preActive) {
      //   $(`[data-value="${preActive}"]`).parent().removeClass('active')
      // }
      $targetMenu.find('.menu .active').each((idx, el) => {
        let $el = $(el)
        if (!$el.children().data('direct')) {
          $el.removeClass('active')
        }
      })

      $target.parent().addClass('active')
      // $targetMenu.data('prev-active', $target.data('value'))

      let $targetWizard = this._getTargetWizard($targetMenu)
      $targetWizard.children('span').text($target.text().trim())

      this._hide($targetWizard)
      this._element.trigger($.Event(Event.SELECTED, { relatedTarget: $target[0] }))
    }

    _toggleBackdrop(callback) {
      let animate = this._element.hasClass('animate') ? 'animate' : ''
      if (this._isOpened) {

        let doAnimate = Util.supportTransitionEnd() && animate
        this._backdrop = $(document.createElement('div'))
          .addClass('dropwizard-backdrop')
          .appendTo(container)

        if (doAnimate) {
          Util.reflow(this._backdrop[0])
        }
        this._backdrop.addClass('in')

        if (!callback) {
          return
        }

        doAnimate ?
          this._backdrop.one(Util.transitionEnd(), callback)
            .emulateTransitionEnd(BACKDROP_TRANSITION_DURATION) :
          callback()
      } else if (!this._isOpened && this._backdrop) {
        this._backdrop.removeClass('in')

        let complete = () => {
          this._backdrop && this._backdrop.remove()
          this._backdrop = null
          callback && callback()
        }

        if (!Util.supportTransitionEnd() || !this._element.hasClass('animate')) {
          return complete()
        }
        this._backdrop.one(Util.transitionEnd(), complete)
          .emulateTransitionEnd(BACKDROP_TRANSITION_DURATION)
      } else if (callback) {
        callback()
      }
    }

    _layoutMenu(menu) {
      let submenus = menu.children(ClassName.SUB_MENU)
      if (submenus.length) {
        menu.find(ClassName.MENU).css('width', '45%')
        submenus.css('width', '55%')
          .css('left', '45%')
      }
    }

    _getTargetMenu(wizard) {
      return $(this._menus.get(wizard.index()))
    }

    _getTargetWizard(menu) {
      return $(this._wizards.get(menu.index() - 1))
    }

    _isActive(wizard) {
      return wizard.hasClass('active')
    }

    _getActive() {
      return this._element.find(Selector.DATA_TOGGLE).filter('.active')
    }

    static _plugin(option) {
      return this.each(function() {
        const $this = $(this)
        let data = $this.data(DATA_KEY)
        let options = $.extend({}, Dropwizard.Default, $this.data(), typeof option == 'object' && option)

        if (!data) $this.data(DATA_KEY, (data = new Dropwizard(this, options)))
        if (typeof option === 'string') data[option]()
      })
    }
  }

  const old = $.fn.dropwizard
  $.fn.dropwizard = Dropwizard._plugin
  $.fn.dropwizard.Constructor = Dropwizard

  // DROPWIZARD NO CONFLICT
  // ======================
  
  $.fn.dropwizard.noConflict = () => {
    $.fn.dropwizard = old
    return this
  }

})(Zepto || jQuery)