export default defineAppConfig({
  socials: [
    {
      label: 'Nuxt Content on Discord',
      icon: 'i-simple-icons-discord',
      to: 'https://discord.gg/sBXDm6e8SP',
      target: '_blank',
      color: 'neutral',
      variant: 'ghost',
    },
    {
      label: 'Nuxt on BlueSKy',
      icon: 'i-simple-icons-bluesky',
      to: 'https://go.nuxt.com/bluesky',
      target: '_blank',
      color: 'neutral',
      variant: 'ghost',
    },
    {
      label: 'Nuxt on X',
      icon: 'i-simple-icons-x',
      to: 'https://x.com/nuxtstudio',
      target: '_blank',
      color: 'neutral',
      variant: 'ghost',
    },
    {
      label: 'Nuxt Content on GitHub',
      icon: 'i-simple-icons-github',
      to: 'https://github.com/nuxt/content',
      target: '_blank',
      color: 'neutral',
      variant: 'ghost',
    },
  ],
  ui: {
    colors: {
      primary: 'green',
      secondary: 'sky',
      neutral: 'slate',
    },
  },
  uiPro: {
    pageHero: {
      slots: {
        title: 'font-semibold sm:text-6xl',
        description: 'sm:text-lg text-(--ui-text-toned) max-w-5xl mx-auto',
        container: 'py-16 sm:py-20 lg:py-24',
      },
    },
    pageSection: {
      slots: {
        title: 'font-semibold lg:text-4xl',
        featureLeadingIcon: 'text-(--ui-text-highlighted)',
      },
    },
  },
})
