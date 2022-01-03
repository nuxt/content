import { benchmark, describe } from './utils.js'

describe('math', () => benchmark('1 + 1', () => 1 + 1))
