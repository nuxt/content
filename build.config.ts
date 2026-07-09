import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // `h3` is provided by the consumer's Nuxt/nitro runtime (used in the module
  // and server handlers), so keep it external instead of bundling it.
  externals: ['h3'],
})
