import groupBy from 'lodash.groupby'

export const state = () => ({
  categories: []
})

export const mutations = {
  setCategories (state, categories) {
    state.categories = categories
  }
}

export const actions = {
  async nuxtServerInit ({ commit }, { $content }) {
    const docs = await $content().sortBy('position', 'asc').fetch()
    const categories = groupBy(docs, 'category')

    commit('setCategories', categories)
  }
}
