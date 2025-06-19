export default defineAppConfig({
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
