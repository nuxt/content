import { fileURLToPath } from 'url'
import { resolve, dirname } from 'pathe'

export const srcDir = resolve(typeof __dirname === 'undefined' ? dirname(fileURLToPath(import.meta.url)) : __dirname)

const _makeResolve = (base: string) => {
  return (...p: string[]) => resolve(base, ...p)
}

export const runtimeDir = resolve(srcDir, 'runtime')
export const resolveRuntimeDir = _makeResolve(runtimeDir)

export const templatesDir = resolve(srcDir, 'templates')
export const resolveTemplatesDir = _makeResolve(templatesDir)
