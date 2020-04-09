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
    localStorage.setItem('theme', theme)
  }
}

export const actions = {
  setTheme ({ commit }) {
    const theme = localStorage.getItem('theme')

    if (theme) {
      commit('setTheme', theme)
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      commit('setTheme', 'dark')
    }
  }
}
