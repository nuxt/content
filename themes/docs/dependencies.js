import ora from 'ora'
import LMIFY from 'lmify'
import { dependencies } from './package.json'

export default async function () {
  let spinner
  const lmify = new LMIFY({ stdout: null, stderr: null, rootDir: __dirname, packageManager: 'yarn' })

  for (const [name, version] of Object.entries(dependencies)) {
    try {
      // TODO: Check if version changed
      require.resolve(name)
    } catch (e) {
      if (!spinner) {
        spinner = ora('Installing @nuxt/content/themes/docs dependencies...').start()
      }

      await lmify.install(`${name}@${version}`)
    }
  }

  if (spinner) {
    spinner.stop()
  }
}
