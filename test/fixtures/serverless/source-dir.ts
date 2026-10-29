import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Copy of `content/`, deleted once prerendering is done: a deployed server doesn't ship its sources.
export const sourceDir = join(tmpdir(), 'nuxt-content-serverless-fixture')
