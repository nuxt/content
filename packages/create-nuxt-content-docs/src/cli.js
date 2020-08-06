#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const sao = require('sao')
const cac = require('cac')
const chalk = require('chalk')
const { version } = require('../package.json')

const generator = path.resolve(__dirname, './')

const cli = cac('create-nuxt-content-docs')

cli
  .command('[out-dir]', 'Generate in a custom directory or current directory')
  .option('--verbose', 'Show debug logs')
  .action((outDir = '.', cliOptions) => {
    const files = fs.existsSync(outDir) ? fs.readdirSync(outDir) : []
    // eslint-disable-next-line no-console
    console.log(chalk`{cyan create-nuxt-content-docs v${version}}`)
    if (files.length) {
      // eslint-disable-next-line no-console
      return console.log(chalk.red(`Can't create ${outDir} because there's already a non-empty directory ${outDir} existing in path.`))
    }
    // eslint-disable-next-line no-console
    console.log(chalk`✨  Generating @nuxt/content documentation in {cyan ${outDir}}`)

    const { verbose, answers } = cliOptions
    const logLevel = verbose ? 4 : 2
    // See https://saojs.org/api.html#standalone-cli
    sao({ generator, outDir, logLevel, answers, cliOptions })
      .run()
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.trace(err)
        process.exit(1)
      })
  })

cli.help()

cli.version(version)

cli.parse()
