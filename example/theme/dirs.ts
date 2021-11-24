import { resolve } from 'path'
import { fileURLToPath } from 'url'

export const distDir = resolve(typeof __dirname === 'undefined' ? fileURLToPath(import.meta.url) : __dirname)

const _makeResolve = (base: string) => {
  return (...p: string[]) => resolve(base, ...p)
}

export const themeDir = resolve(distDir, './')
export const resolveThemeDir = _makeResolve(themeDir)
