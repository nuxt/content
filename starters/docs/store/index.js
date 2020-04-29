import groupBy from 'lodash.groupby'

export const state = () => ({
  categories: {}
})

export const mutations = {
  setCategories (state, categories) {
    state.categories[this.$i18n.locale] = categories
  }
}

export const actions = {
  async fetchCategories ({ commit, state }) {
    if (state.categories[this.$i18n.locale]) {
      return
    }

    const docs = await this.$content(this.$i18n.locale).sortBy('position', 'asc').fetch()
    const categories = groupBy(docs, 'category')

    commit('setCategories', categories)
  },
  async nuxtServerInit ({ dispatch }) {
    await dispatch('fetchCategories')
  }
}
