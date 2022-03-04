import { pathToFileURL } from 'url'
import { runSuites } from './utils.js'

const files = process.argv.slice(2)

const importModule = (path: string) => import(pathToFileURL(path).href)

Promise.all(files.map(importModule)).then(() => runSuites())
