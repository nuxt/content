import { resolve } from 'path'
import fs from 'fs/promises'
import jiti from 'jiti'
import { logger } from './log'

export const r = (...args: string[]) => resolve(__dirname, '../..', ...args)

const _require = jiti(__filename)

export function tryRequire(name: string) {
  try {
    const _plugin = _require(require.resolve(name))

    return _plugin.default || _plugin
  } catch (e) {
    logger.error(e.toString())
    return null
  }
}

export function readFile(path: string) {
  return fs.readFile(path, { encoding: 'utf8' })
}

export async function exists(path: string) {
  const pathExists = await fs.stat(path).catch(() => false)

  return !!pathExists
}
