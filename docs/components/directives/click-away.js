let handleOutsideClick

export default {
  bind (el, binding, vnode) {
    handleOutsideClick = (e) => {
      e.stopPropagation()

      // Trigger close if the clicked element is not in the dialog element (except if it's a link)
      if (!el.contains(e.target) || e.target.href) {
        vnode.context[binding.value]()
      }
    }

    document.addEventListener('click', handleOutsideClick)
  },

  unbind () {
    document.removeEventListener('click', handleOutsideClick)
  }
}
