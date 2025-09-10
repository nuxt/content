import { addDependency } from 'nypm'
import { logger } from './dev'
import nuxtContentContext from './context'
import { tryUseNuxt } from '@nuxt/kit'

export async function isPackageInstalled(packageName: string) {
  try {
    await import(packageName)
    return true
  }
  catch {
    return false
  }
}

export async function ensurePackageInstalled(pkg: string) {
  if (!await isPackageInstalled(pkg)) {
    logger.error(`Nuxt Content requires \`${pkg}\` module to operate.`)

    const confirm = await logger.prompt(`Do you want to install \`${pkg}\` package?`, {
      type: 'confirm',
      name: 'confirm',
      initial: true,
    })

    if (!confirm) {
      logger.error(`Nuxt Content requires \`${pkg}\` module to operate. Please install \`${pkg}\` package manually and try again. \`npm install ${pkg}\``)
      process.exit(1)
    }

    await addDependency(pkg, {
      cwd: tryUseNuxt()?.options.rootDir,
    })
  }
}

export function isNodeSqliteAvailable() {
  try {
    const module = globalThis.process?.getBuiltinModule?.('node:sqlite')

    if (module) {
      // When using the SQLite Node.js prints warnings about the experimental feature
      // This is workaround to surpass the SQLite warning
      // Inspired by Yarn https://github.com/yarnpkg/berry/blob/182046546379f3b4e111c374946b32d92be5d933/packages/yarnpkg-pnp/sources/loader/applyPatch.ts#L307-L328
      const originalEmit = process.emit
      // @ts-expect-error - TS complains about the return type of originalEmit.apply
      process.emit = function (...args) {
        const name = args[0]
        const data = args[1] as { name: string, message: string }
        if (
          name === `warning`
          && typeof data === `object`
          && data.name === `ExperimentalWarning`
          && data.message.includes(`SQLite is an experimental feature`)
        ) {
          return false
        }
        return originalEmit.apply(process, args as unknown as Parameters<typeof process.emit>)
      }

      return true
    }

    return false
  }
  catch {
    return false
  }
}

export async function initiateValidatorsContext() {
  if (await isPackageInstalled('valibot') && await isPackageInstalled('@valibot/to-json-schema')) {
    nuxtContentContext().set('valibot', await import('./schema/valibot'))
  }
  if (await isPackageInstalled('zod')) {
    nuxtContentContext().set('zod3', await import('./schema/zod3'))
    nuxtContentContext().set('zod4', await import('./schema/zod4'))
  }
}
