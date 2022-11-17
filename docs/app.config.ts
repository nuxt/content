export default defineAppConfig({
  docus: {
    title: 'Nuxt Content',
    description: 'Write pages in markdown, use Vue components and enjoy the power of Nuxt with a blazing fast developer experience.',
    layout: 'docs',
    image: 'https://content.nuxtjs.org/preview.png',
    url: 'https://content.nuxtjs.org',
    debug: false,
    socials: {
      twitter: '@nuxt_js',
      github: 'nuxt/content'
    },
    github: {
      root: 'docs/content',
      edit: true,
      releases: true
    },
    cover: {
      src: '/cover.jpg',
      alt: 'Content made easy for Vue developers'
    },
    aside: {
      level: 1
    },
    header: {
      title: '',
      logo: true,
      exclude: ['/v1', '/content-v1', '/fr', '/ja', '/ru']
    },
    footer: {
      iconLinks: [
        {
          label: 'NuxtJS',
          href: 'https://nuxtjs.org',
          icon: 'IconNuxt'
        },
        {
          label: 'Vue Telescope',
          href: 'https://vuetelescope.com',
          icon: 'IconVueTelescope'
        }
      ]
    }
  }
})
