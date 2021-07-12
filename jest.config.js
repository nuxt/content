module.exports = {
  transform: {
    '\\.(js|ts)$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-runtime']
      }
    ]
  },
  // TODO: Fix coverage
  collectCoverage: false,
  collectCoverageFrom: ['src/**', '!templates/**', '!example/**', '!.nuxt/**', '!src/i18n/languages/**'],
  coveragePathIgnorePatterns: ['node_modules', '.nuxt'],
  transformIgnorePatterns: ['node_modules/(?!@docus/app/|nuxt-i18n/*)']
}
