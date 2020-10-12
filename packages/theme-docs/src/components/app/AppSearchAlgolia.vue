<template>
  <div id="docsearch" class="lg:w-full" />
</template>

<script>
function isSpecialClick (event) {
  return (
    event.button === 1 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  )
}

export default {
  props: {
    options: {
      type: Object,
      required: true
    },
    settings: {
      type: Object,
      required: true
    }
  },
  watch: {
    '$i18n.locale' (newValue) {
      this.update(this.options, newValue)
    },
    options (newValue) {
      this.update(newValue, this.$i18n.locale)
    }
  },
  mounted () {
    this.initialize(this.options, this.$i18n.locale)
  },
  methods: {
    stripTrailingSlash (url) {
      return url.replace(/\/$|\/(?=\?)|\/(?=#)/g, '')
    },
    getRelativePath (absoluteUrl) {
      const { pathname, hash } = new URL(absoluteUrl)
      const url = pathname.replace(this.settings.url, '/') + hash
      return this.stripTrailingSlash(url)
    },
    initialize (userOptions, code) {
      const lang = this.$i18n.locales.find(locale => locale.code === code)

      Promise.all([
        import(/* webpackChunkName: "docsearch" */ '@docsearch/js'),
        import(/* webpackChunkName: "docsearch" */ '@docsearch/css')
      ]).then(([docsearch]) => {
        docsearch = docsearch.default

        docsearch(
          Object.assign(
            {},
            userOptions,
            {
              container: '#docsearch',
              searchParameters: Object.assign(
                {},
                lang && {
                  facetFilters: [`${userOptions.langAttribute || 'language'}:${lang.iso}`].concat(
                    userOptions.facetFilters || []
                  )
                }
              ),
              navigator: {
                navigate: ({ suggestionUrl }) => {
                  const { pathname: hitPathname } = new URL(
                    window.location.origin + suggestionUrl
                  )

                  // Vue Router doesn't handle same-page navigation so we use
                  // the native browser location API for anchor navigation.
                  if (this.$router.history.current.path === hitPathname) {
                    window.location.assign(
                      window.location.origin + suggestionUrl
                    )
                  } else {
                    this.$router.push(suggestionUrl)
                  }
                }
              },
              transformItems: (items) => {
                return items.map((item) => {
                  return Object.assign({}, item, {
                    url: this.getRelativePath(item.url)
                  })
                })
              },
              hitComponent: ({ hit, children }) => {
                return {
                  type: 'a',
                  ref: undefined,
                  constructor: undefined,
                  key: undefined,
                  props: {
                    href: hit.url,
                    onClick: (event) => {
                      if (isSpecialClick(event)) {
                        return
                      }

                      // We rely on the native link scrolling when user is
                      // already on the right anchor because Vue Router doesn't
                      // support duplicated history entries.
                      if (this.$router.history.current.fullPath === hit.url) {
                        return
                      }

                      const { pathname: hitPathname } = new URL(
                        window.location.origin + hit.url
                      )

                      // If the hits goes to another page, we prevent the native link behavior
                      // to leverage the Vue Router loading feature.
                      if (this.$router.history.current.path !== hitPathname) {
                        event.preventDefault()
                      }

                      this.$router.push(hit.url)
                    },
                    children
                  }
                }
              }
            }
          )
        )
      })
    },
    update (options, lang) {
      this.$el.innerHTML = '<div id="docsearch"></div>'
      this.initialize(options, lang)
    }
  }
}
</script>

<style>
.DocSearch {
  --docsearch-primary-color: var(--color-primary-500);
  --docsearch-highlight-color: var(--docsearch-primary-color);

  --docsearch-text-color: var(--color-gray-700);
  --docsearch-modal-background: var(--color-gray-100);
  --docsearch-searchbox-shadow: inset 0 0 0 2px var(--docsearch-primary-color);
  --docsearch-searchbox-background: var(--color-gray-200);
  --docsearch-searchbox-focus-background: var(--color-gray-200);
  --docsearch-hit-color: var(--color-gray-700);
  --docsearch-muted-color: var(--color-gray-500);
}

.DocSearch-Button {
  @apply w-full ml-0 rounded-md px-3 !important;
}

.DocSearch-Button-Placeholder {
  @apply px-3 !important;
}

.DocSearch-Screen-Icon > svg {
  display: inline !important;
}

.dark-mode {
  & .DocSearch {
    --docsearch-text-color: var(--color-gray-300);
    --docsearch-container-background: rgba(9,10,17,0.8);
    --docsearch-modal-background: var(--color-gray-900);
    --docsearch-modal-shadow: inset 1px 1px 0 0 #2c2e40,0 3px 8px 0 #000309;
    --docsearch-searchbox-background: var(--color-gray-800);
    --docsearch-searchbox-focus-background: var(--color-gray-800);
    --docsearch-hit-color: var(--color-gray-300);
    --docsearch-hit-shadow: none;
    --docsearch-hit-background: var(--color-gray-800);
    --docsearch-key-gradient: linear-gradient(-26.5deg,#565872,#31355b);
    --docsearch-key-shadow: inset 0 -2px 0 0 #282d55,inset 0 0 1px 1px #51577d,0 2px 2px 0 rgba(3,4,9,0.3);
    --docsearch-footer-background: var(--color-gray-800);
    --docsearch-footer-shadow: inset 0 1px 0 0 rgba(73,76,106,0.5),0 -4px 8px 0 rgba(0,0,0,0.2);
    --docsearch-logo-color: #fff;
    --docsearch-muted-color: var(--color-gray-500);
  }
}
</style>
