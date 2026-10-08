import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** Whether the consuming project ships its own landing page (`app/pages/index.vue`). */
export function landingPageExists(rootDir: string): boolean {
  return ['app/pages/index.vue', 'pages/index.vue'].some(path => existsSync(join(rootDir, path)))
}

/** Whether the project keeps its docs under `content/docs` (or `content/<locale>/docs`). */
export function docsFolderExists(rootDir: string, locale?: string): boolean {
  return existsSync(join(rootDir, 'content', ...(locale ? [locale] : []), 'docs'))
}
