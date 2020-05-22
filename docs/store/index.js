import Vue from 'vue'
import groupBy from 'lodash.groupby'

export const state = () => ({
  categories: {}
})

export const mutations = {
  SET_CATEGORIES (state, categories) {
    // Vue Reactivity rules since we add a nested object
    Vue.set(state.categories, this.$i18n.locale, categories)
  }
}

export const actions = {
  async fetchCategories ({ commit, state }) {
    // Avoid re-fetching in production
    if (process.dev === false && state.categories[this.$i18n.locale]) {
      return
    }
    const docs = await this.$content(this.$i18n.locale).only(['category', 'title', 'slug']).sortBy('position', 'asc').fetch()
    const categories = groupBy(docs, 'category')

    commit('SET_CATEGORIES', categories)
  }
}
