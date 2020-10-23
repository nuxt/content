module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/**/*.js',
    '!lib/templates/**/*'
  ],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/lib/$1',
    '^~~$': '<rootDir>',
    '^@@$': '<rootDir>',
    '^@/(.*)$': '<rootDir>/lib/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nuxt-i18n)/)'
  ]
}
