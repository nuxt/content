module.exports = {
  preset: '@nuxt/test-utils',
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.mjs$': 'babel-jest'
  },

  setupFilesAfterEnv: ['./test/utils/setup-env'],

  moduleNameMapper: {},
  collectCoverageFrom: ['src/**', '!src/types/**'],
  transformIgnorePatterns: ['node_modules/(?!@nuxt/design|@docus/mdc|unified)/.*']
}
