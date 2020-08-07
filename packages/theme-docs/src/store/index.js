import Vue from 'vue'
import groupBy from 'lodash.groupby'
import { fetchGithub, sortByVersion } from '../api/github'

export const state = () => ({
  categories: {},
  releases: [],
  tags: [],
  settings: {
    title: 'Nuxt Content Docs',
    defaultBranch: ''
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
  },
  tags (state) {
    return state.tags
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
  SET_TAGS (state, tags) {
    state.tags = tags
  },
  SET_DEFAULT_BRANCH (state, branch) {
    state.settings.defaultBranch = branch
  },
  SET_SETTINGS (state, settings) {
    state.settings = Object.assign({}, settings)
  }
}

export const actions = {
  async fetchCategories ({ commit, state }) {
    // Avoid re-fetching in production
    if (process.dev === false && state.categories[this.$i18n.locale]) {
      return
    }

    const docs = await this.$content(this.$i18n.locale, { deep: true })
      .only(['title', 'menuTitle', 'category', 'slug', 'version', 'to'])
      .sortBy('position', 'asc')
      .fetch()

    if (state.settings.github) {
      docs.push({ slug: 'releases', title: 'Releases', category: 'Community', to: '/releases' })
    }

    if (state.tags.length > 0) {
      docs.push({ slug: 'tags', title: 'Tags', category: 'Community', to: '/tags' })
    }

    const categories = groupBy(docs, 'category')
    commit('SET_CATEGORIES', categories)
  },
  async fetchReleases ({ commit, state }) {
    if (!state.settings.github) {
      return
    }

    const data = await fetchGithub(state.settings.github, 'releases') || []
    const releases = data.filter(r => !r.draft).map((release) => {
      return {
        name: (release.name || release.tag_name).replace('Release ', ''),
        date: release.published_at,
        body: this.$markdown(release.body)
      }
    })

    releases.sort(sortByVersion)
    commit('SET_RELEASES', releases)
  },
  async fetchTags ({ commit, state }) {
    if (!state.settings.github) {
      return
    }

    const data = await fetchGithub(state.settings.github, 'tags') || []
    const tags = await Promise.all(data.map(async (tag) => {
      let date = null

      if (tag.commit && tag.commit.sha) {
        const { commit } = await fetchGithub(state.settings.github, `commits/${tag.commit.sha}`) || {}

        if (commit && commit.committer) {
          date = commit.committer.date
        }
      }

      return {
        name: tag.name,
        zipball: tag.zipball_url,
        tarball: tag.tarball_url,
        date
      }
    }))

    tags.sort(sortByVersion)
    commit('SET_TAGS', tags)
  },
  async fetchDefaultBranch ({ commit, state }) {
    if (!state.settings.github || state.settings.defaultBranch) {
      return
    }

    const data = await fetchGithub(state.settings.github) || {}
    commit('SET_DEFAULT_BRANCH', data.defaultDranch || 'main')
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
