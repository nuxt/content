export default defineAppConfig({
  ui: {
    primary: 'green',
    gray: 'slate',
    button: {
      color: {
        white: {
          link: 'text-white dark:text-white hover:text-gray-300 dark:hover:text-gray-300 underline-offset-4 hover:underline focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 transition-all duration-200'
        },
        transparent: {
          outline: 'ring-1 ring-inset ring-gray-700 text-white dark:text-white hover:bg-gray-900 disabled:bg-gray-300 dark:hover:bg-gray-900 dark:disabled:bg-gray-300 focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-400'
        }
      }
    },
    content: {
      prose: {
        code: {
          icon: {
            // terminal: 'i-ph-terminal'
          }
        }
      }
    }
  },
  elements: {
    variables: {
      light: {
        background: '255 255 255',
        foreground: 'var(--color-gray-700)'
      },
      dark: {
        background: 'var(--color-gray-950)',
        foreground: 'var(--color-gray-400)'
      }
    }
  }
})
