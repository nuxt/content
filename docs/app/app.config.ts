export default defineAppConfig({
  socials: {
    discord: 'https://discord.gg/sBXDm6e8SP',
    bluesky: 'https://go.nuxt.com/bluesky',
    x: 'https://x.com/nuxtstudio',
  },
  ui: {
    colors: {
      primary: 'green',
      secondary: 'sky',
      neutral: 'slate',
    },
    pageSection: {
      slots: {
        title: 'font-semibold lg:text-4xl',
        featureLeadingIcon: 'text-(--ui-text-highlighted)',
      },
    },
    prose: {
      codePreview: {
        slots: {
          preview: 'rounded-t-none border-(--ui-border-muted) bg-(--ui-bg-muted)',
        },
      },
    },
  },
  github: {
    rootDir: 'docs',
  },
})
