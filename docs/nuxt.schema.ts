import { field, group } from '@nuxt/content/studio'

export default defineNuxtSchema({
  appConfig: {
    ui: group({
      title: 'UI',
      description: 'UI Customization.',
      icon: 'i-lucide-palette',
      fields: {
        colors: group({
          title: 'Colors',
          description: 'Customize color aliases',
          icon: 'i-lucide-brush',
          fields: {
            primary: field({
              type: 'string',
              title: 'Primary',
              description: 'Primary color of your UI.',
              icon: 'i-lucide-brush',
              default: 'green',
              required: ['sky', 'mint', 'rose', 'amber', 'violet', 'emerald', 'fuchsia', 'indigo', 'lime', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow', 'green', 'blue', 'cyan', 'gray', 'white', 'black'],
            }),
            secondary: field({
              type: 'string',
              title: 'Secondary',
              description: 'Secondary color of your UI.',
              icon: 'i-lucide-brush',
              default: 'sky',
              required: ['sky', 'mint', 'rose', 'amber', 'violet', 'emerald', 'fuchsia', 'indigo', 'lime', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow', 'green', 'blue', 'cyan', 'gray', 'white', 'black'],
            }),
            neutral: field({
              type: 'string',
              title: 'Neutral',
              description: 'Neutral color of your UI.',
              icon: 'i-lucide-brush',
              default: 'slate',
              required: ['slate', 'cool', 'zinc', 'neutral', 'stone'],
            }),
          },
        }),
      },
    }),
  },
})
