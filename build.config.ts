// `unbuild` is only a transitive dependency (via `@nuxt/module-builder`), so this
// is a plain object rather than `defineBuildConfig()`, which only adds typing.
export default {
  // `h3` is provided by the consumer's Nuxt/nitro runtime (used in the module
  // and server handlers), so keep it external instead of bundling it.
  externals: ['h3'],
}
