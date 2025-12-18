// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import { mdcLint } from 'mdclint'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: true,
  },
  dirs: {
    src: [
      './playground',
      './examples/blog',
    ],
  },
})
  .append(
    {
      rules: {
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
      },
    },
  )
  .append(mdcLint({
    files: [
      'docs/**/*.md',
      'playground/**/*.md',
      'examples/**/*.md',
      'README.md',
    ],
    config: {
      MD013: false,
      // TODO: detect the issue
      MD051: false,

      // TODO: fix the issue
      MD060: false,
    },
  }))
