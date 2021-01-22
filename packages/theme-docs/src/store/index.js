import Vue from 'vue'
import groupBy from 'lodash.groupby'
import { fetchGithub, sortByVersion } from '../api/github'
import defu from 'defu'

export const state = () => ({
  categories: {},
  releases: [],
  tags: [],
  settings: {
    title: 'Nuxt Content Docs',
    url: '',
    defaultDir: 'docs',
    defaultBranch: '',
    filled: false,
    releases: true,
    tags: true
  }
})

export const getters = {
  settings (state) {
    return state.settings
  },
  githubUrls (state) {
    const { github = '', githubApi = '' } = state.settings

    // GitHub Enterprise
    if (github.startsWith('http') && githubApi.startsWith('http')) {
      return {
        repo: github,
        api: {
          repo: githubApi,
          releases: `${githubApi}/releases`,
          tags: `${githubApi}/tags`
        }
      }
    }

    // GitHub
    return {
      repo: `https://github.com/${github}`,
      api: {
        repo: `https://api.github.com/repos/${github}`,
        releases: `https://api.github.com/repos/${github}/releases`,
        tags: `https://api.github.com/repos/${github}/tags`,
      }
    }
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
    state.settings = defu({ filled: true }, settings, state.settings)
    if (!state.settings.url) {
      // eslint-disable-next-line no-console
      console.warn('Please provide the `url` property in `content/setting.json`')
    }
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

    if (state.releases.length > 0) {
      docs.push({ slug: 'releases', title: 'Releases', category: 'Community', to: '/releases' })
    }

    if (state.tags.length > 0) {
      docs.push({ slug: 'tags', title: 'Tags', category: 'Community', to: '/tags' })
    }

    const categories = groupBy(docs, 'category')
    commit('SET_CATEGORIES', categories)
  },
  async fetchReleases ({ commit, state, getters }) {
    if (!state.settings.github || !state.settings.releases) {
      return
    }

    const data = await fetchGithub(getters.githubUrls.api.releases) || []
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
  async fetchTags ({ commit, state, getters }) {
    if (!state.settings.github || !state.settings.tags) {
      return
    }

    const data = await fetchGithub(getters.githubUrls.api.tags) || []
    const tags = await Promise.all(data.map(async (tag) => {
      let date = null

      if (tag.commit && tag.commit.sha) {
        const { commit } = await fetchGithub(`${getters.githubUrls.api.repo}/commits/${tag.commit.sha}`) || {}

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
  async fetchDefaultBranch ({ commit, state, getters }) {
    if (!state.settings.github || state.settings.defaultBranch) {
      return
    }

    const data = await fetchGithub(getters.githubUrls.api.repo) || {}
    commit('SET_DEFAULT_BRANCH', data.defaultDranch || 'main')
  },
  async fetchSettings ({ commit }) {
    try {
      const { dir, extension, path, slug, to, createdAt, updatedAt, ...settings } = await this.$content('settings').fetch()

      commit('SET_SETTINGS', settings)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('You can add a `settings.json` file inside the `content/` folder to customize this theme.')
    }
  }
}
