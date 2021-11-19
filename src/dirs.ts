import { resolve } from 'path'
import { fileURLToPath } from 'url'

export const distDir = resolve(typeof __dirname === 'undefined' ? fileURLToPath(import.meta.url) : __dirname)

const _makeResolve = (base: string) => {
  return (...p: string[]) => resolve(base, ...p)
}

export const runtimeDir = resolve(distDir, 'runtime')
export const resolveRuntimeDir = _makeResolve(runtimeDir)

export const templateDir = resolve(distDir, 'templates')
export const resolveTemplateDir = _makeResolve(templateDir)

export const appDir = resolve(runtimeDir, 'app')
export const resolveAppDir = _makeResolve(appDir)

export const componentsDir = resolve(appDir, 'components')
export const resolveComponentsDir = _makeResolve(componentsDir)
