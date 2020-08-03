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
        message: 'Project title:'
      },
      {
        name: 'url',
        message: 'Documentation url:'
      },
      {
        name: 'github',
        message: 'GitHub repository (owner/name):'
      },
      {
        name: 'twitter',
        message: 'Twitter username:'
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
