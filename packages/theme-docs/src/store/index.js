import Vue from 'vue'
import groupBy from 'lodash.groupby'

export const state = () => ({
  categories: {},
  releases: [],
  settings: {
    title: 'Nuxt Content Docs',
    defaultDir: 'docs',
    defaultBranch: '',
    filled: false
  }
})

export const getters = {
  settings (state) {
    return state.settings
  },
  releases (state) {
    return state.releases
  },
  lastRelease (state) {
    return state.releases[0]
  }
}

export const mutations = {
  SET_CATEGORIES (state, categories) {
    // Vue Reactivity rules since we add a nested object
    Vue.set(state.categories, this.$i18n.locale, categories)
  },
  SET_RELEASES (state, releases) {
    state.releases = releases
  },
  SET_DEFAULT_BRANCH (state, branch) {
    state.settings.defaultBranch = branch
  },
  SET_SETTINGS (state, settings) {
    state.settings = Object.assign({}, state.settings, settings, { filled: true })
  }
}

export const actions = {
  async fetchCategories ({ commit, state }) {
    // Avoid re-fetching in production
    if (process.dev === false && state.categories[this.$i18n.locale]) {
      return
    }
    const docs = await this.$content(this.$i18n.locale, { deep: true }).only(['title', 'menuTitle', 'category', 'slug', 'version', 'to']).sortBy('position', 'asc').fetch()
    if (state.releases.length > 0) {
      docs.push({ slug: 'releases', title: 'Releases', category: 'Community', to: '/releases' })
    }
    const categories = groupBy(docs, 'category')

    commit('SET_CATEGORIES', categories)
  },
  async fetchReleases ({ commit, state }) {
    if (!state.settings.github) {
      return
    }

    const options = {}
    if (process.env.GITHUB_TOKEN) {
      options.headers = { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    }
    let releases = []
    try {
      const data = await fetch(`https://api.github.com/repos/${state.settings.github}/releases`, options).then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        return res
      }).then(res => res.json())
      releases = data.filter(r => !r.draft).map((release) => {
        return {
          name: (release.name || release.tag_name).replace('Release ', ''),
          date: release.published_at,
          body: this.$markdown(release.body)
        }
      })
    } catch (e) { }

    const getMajorVersion = r => r.name && Number(r.name.substring(1, 2))
    releases.sort((a, b) => {
      const aMajorVersion = getMajorVersion(a)
      const bMajorVersion = getMajorVersion(b)
      if (aMajorVersion !== bMajorVersion) {
        return bMajorVersion - aMajorVersion
      }
      return new Date(b.date) - new Date(a.date)
    })

    commit('SET_RELEASES', releases)
  },
  async fetchDefaultBranch ({ commit, state }) {
    if (!state.settings.github || state.settings.defaultBranch) {
      return
    }

    const options = {}
    if (process.env.GITHUB_TOKEN) {
      options.headers = { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    }
    let defaultBranch
    try {
      const data = await fetch(`https://api.github.com/repos/${state.settings.github}`, options).then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        return res
      }).then(res => res.json())
      defaultBranch = data.default_branch
    } catch (e) { }

    commit('SET_DEFAULT_BRANCH', defaultBranch || 'main')
  },
  async fetchSettings ({ commit }) {
    try {
      const settings = await this.$content('settings').fetch()
      commit('SET_SETTINGS', settings)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('You can add a `settings.json` file inside the `content/` folder to customize this theme.')
    }
  }
}
