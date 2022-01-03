import { importModule } from '../setup.js'
import { runSuites } from './utils.js'

const files = process.argv.slice(2)

Promise.all(files.map(importModule)).then(() => runSuites())
