import { resolve } from 'path'
import { fileURLToPath } from 'url'

export const distDir = resolve(typeof __dirname === 'undefined' ? fileURLToPath(import.meta.url) : __dirname)

const _makeResolve = (base: string) => {
  return (...p: string[]) => resolve(base, ...p)
}

export const appDir = resolve(distDir, '../app')
export const rAppDir = _makeResolve(appDir)

export const runtimeDir = resolve(distDir, 'runtime')
export const rRuntimeDir = _makeResolve(runtimeDir)
