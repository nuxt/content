export default ({ app, store }) => {
  // For mobile navigation when clicking on a menu link
  app.router.afterEach(() => {
    if (store.state.menu.open) {
      setTimeout(() => store.commit('menu/close'), 10)
    }
  })
}
