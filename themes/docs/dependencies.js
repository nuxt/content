import ora from 'ora'
import LMIFY from 'lmify'
import { dependencies } from './package.json'

export default async function () {
  const lmify = new LMIFY({ stdout: null, stderr: null, rootDir: __dirname, packageManager: 'yarn' })
  const spinner = ora('Installing @nuxt/content/themes/docs dependencies...').start()

  for (const [name, version] of Object.entries(dependencies)) {
    try {
      // TODO: Check if version changed
      require.resolve(name)
    } catch (e) {
      await lmify.install(`${name}@${version}`)
    }
  }

  spinner.stop()
}
