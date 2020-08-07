module.exports = {
  prompts () {
    return [
      {
        name: 'name',
        message: 'Project name:',
        default: this.outFolder,
        filter: val => val.toLowerCase()
      },
      {
        name: 'title',
        message: 'Project title:',
        default: 'Nuxt Content'
      },
      {
        name: 'url',
        message: 'Documentation url:',
        url: 'https://content.nuxtjs.org'
      },
      {
        name: 'github',
        message: 'GitHub repository (owner/name):',
        default: 'nuxt/content'
      },
      {
        name: 'twitter',
        message: 'Twitter username (@username):',
        default: '@nuxt_js'
      },
      {
        name: 'pm',
        message: 'Package manager:',
        choices: [
          { name: 'Yarn', value: 'yarn' },
          { name: 'Npm', value: 'npm' }
        ],
        type: 'list',
        default: 'yarn'
      }
    ]
  },
  templateData () {
    const pm = this.answers.pm === 'yarn' ? 'yarn' : 'npm'
    const pmRun = this.answers.pm === 'yarn' ? 'yarn' : 'npm run'

    return {
      pm,
      pmRun
    }
  },
  actions: [
    {
      type: 'add',
      files: '**',
      templateDir: '../template'
    },
    {
      type: 'move',
      patterns: {
        gitignore: '.gitignore',
        '_package.json': 'package.json'
      }
    }
  ],
  async completed () {
    this.gitInit()
    await this.npmInstall()
    this.showProjectTips()
  }
}
