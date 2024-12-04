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
        description: 'sm:text-lg text-[var(--ui-text-toned)] max-w-5xl mx-auto',
      },
    },
    pageSection: {
      slots: {
        title: 'font-semibold lg:text-4xl',
        featureLeadingIcon: 'text-[var(--ui-text-highlighted)]',
      },
    },
  },
})
