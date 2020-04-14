export const state = () => ({
  theme: 'light'
})

export const getters = {
  theme (state) {
    return state.theme
  }
}

export const mutations = {
  setTheme (state, theme) {
    state.theme = theme
  }
}
