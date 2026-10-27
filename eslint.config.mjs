// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

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
      './examples/v3-multi-source',
      './examples/v3-layers',
      './examples/v3-layers/layer/app',
      './examples/hybrid-v3-compatibility/app',
      './examples/hybrid-v4-pure/app',
      './test/fixtures/components',
    ],
  },
})
  .append(
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Playground components are short demo names used as markdown tags (`::bundled`).
      files: ['playground/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
    {
      // Upstream v3 starters, fetched as-is so the compatibility tests run the real configs.
      ignores: [
        './examples/basic/**',
        './examples/blog/**',
        './examples/i18n/**',
        './examples/ui/**',
      ],
    },
  )
