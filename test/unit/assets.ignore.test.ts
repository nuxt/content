import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'pathe'
import { defineLocalSource } from '../../src/utils/source'
import { setAssetExtensions } from '../../src/utils/assets/state'
import { DEFAULT_ASSET_EXTENSIONS } from '../../src/utils/assets/shared'

describe('assets exclusion from content collection keys', () => {
  let dir: string

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'nc-assets-'))
    await writeFile(join(dir, 'post.md'), '# hi')
    await writeFile(join(dir, 'data.json'), '{}')
    await writeFile(join(dir, 'photo.jpg'), 'x')
    await writeFile(join(dir, 'clip.mp4'), 'x')
  })

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('keeps content files and drops assets when the feature is enabled', async () => {
    setAssetExtensions(DEFAULT_ASSET_EXTENSIONS)
    const source = defineLocalSource({ include: '**', cwd: dir })
    await source.prepare!({ rootDir: dir })
    const keys = await source.getKeys!()
    expect(keys.sort()).toEqual(['data.json', 'post.md'])
  })

  it('does not filter anything when the feature is disabled', async () => {
    setAssetExtensions([])
    const source = defineLocalSource({ include: '**', cwd: dir })
    await source.prepare!({ rootDir: dir })
    const keys = await source.getKeys!()
    expect(keys.sort()).toEqual(['clip.mp4', 'data.json', 'photo.jpg', 'post.md'])
    setAssetExtensions(DEFAULT_ASSET_EXTENSIONS)
  })
})
