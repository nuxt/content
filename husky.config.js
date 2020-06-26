module.exports = {
  hooks: {
    'pre-commit': 'yarn lint',
    'pre-push': 'yarn lint'
  }
}
