export const state = () => ({
  open: false
})

export const mutations = {
  toggle (state, open) {
    state.open = open !== undefined ? open : !state.open
  }
}
