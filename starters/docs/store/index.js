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
  async nuxtServerInit ({ commit }, { $content, app }) {
    const docs = await $content(app.i18n.locale).sortBy('position', 'asc').fetch()
    const categories = groupBy(docs, 'category')

    commit('setCategories', categories)
  }
}
