import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { resolve, dirname } from 'pathe'

export const r = (...paths: string[]) => resolve(typeof __dirname === 'undefined' ? dirname(fileURLToPath(import.meta.url)) : __dirname, ...paths)

export default defineConfig({})
