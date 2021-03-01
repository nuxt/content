const path = require('path')
const fs = require('graceful-fs').promises
const { build, init, generatePort, loadConfig } = require('@nuxtjs/module-test-utils')

describe('content cache', () => {
  const config = {
    ...loadConfig(__dirname),
    buildDir: path.join(__dirname, 'fixture', '.nuxt-dev'),
    content: {
      useCache: true
    }
  }

  const dbFilePath = path.join(config.buildDir, 'content', 'content.db')

  describe('during build', () => {
    let nuxt

    beforeAll(async () => {
      fs.unlink(dbFilePath).catch(() => {});
      ({ nuxt } = (await build(config)))
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
    })

    test('should be generated', async () => {
      await expect(fs.access(dbFilePath)).resolves.not.toThrow()
    })

    test('should be a valid json', async () => {
      const fileTextContent = await fs.readFile(dbFilePath)
      await expect(() => JSON.parse(fileTextContent)).not.toThrow()
    })
  })

  describe('during start in production mode', () => {
    const mockDbDump = '{"_env":"NODEJS","_serializationMethod":"normal","_autosave":false,"_autosaveInterval":5000,"_collections":[{"name":"items","unindexedSortComparator":"js","defaultLokiOperatorPackage":"js","_dynamicViews":[],"uniqueNames":[],"transforms":{},"rangedIndexes":{},"_data":[{"slug":"about","title":"Serialized test","toc":[],"body":{"type":"root","children":[{"type":"element","tag":"p","props":{},"children":[{"type":"text","value":"This is the serialized page!"}]}]},"text":"\\nThis is the serialized page!\\n","dir":"/","path":"/about","extension":".md","createdAt":"2021-02-11T22:10:21.655Z","updatedAt":"2021-02-12T20:13:23.079Z","meta":{"version":0,"revision":0,"created":1613160831274},"$loki":1}],"idIndex":[1],"maxId":1,"_dirty":true,"_nestedProperties":[],"transactional":false,"asyncListeners":false,"disableMeta":false,"disableChangesApi":true,"disableDeltaChangesApi":true,"cloneObjects":false,"cloneMethod":"deep","changes":[],"_fullTextSearch":{"ii":{"title":{"_store":true,"_optimizeChanges":true,"docCount":1,"docStore":[[0,{"fieldLength":2}]],"totalFieldLength":2,"root":{"k":[115,116],"v":[{"k":[101],"v":[{"k":[114],"v":[{"k":[105],"v":[{"k":[97],"v":[{"k":[108],"v":[{"k":[105],"v":[{"k":[122],"v":[{"k":[101],"v":[{"k":[100],"v":[{"d":{"df":1,"dc":[[0,1]]}}]}]}]}]}]}]}]}]}]},{"k":[101],"v":[{"k":[115],"v":[{"k":[116],"v":[{"d":{"df":1,"dc":[[0,1]]}}]}]}]}]}},"description":{"_store":true,"_optimizeChanges":true,"docCount":0,"docStore":[],"totalFieldLength":0,"root":{}},"slug":{"_store":true,"_optimizeChanges":true,"docCount":1,"docStore":[[0,{"fieldLength":1}]],"totalFieldLength":1,"root":{"k":[97],"v":[{"k":[98],"v":[{"k":[111],"v":[{"k":[117],"v":[{"k":[116],"v":[{"d":{"df":1,"dc":[[0,1]]}}]}]}]}]}]}},"text":{"_store":true,"_optimizeChanges":true,"docCount":1,"docStore":[[0,{"fieldLength":5}]],"totalFieldLength":5,"root":{"k":[116,105,115,112],"v":[{"k":[104],"v":[{"k":[105,101],"v":[{"k":[115],"v":[{"d":{"df":1,"dc":[[0,1]]}}]},{"d":{"df":1,"dc":[[0,1]]}}]}]},{"k":[115],"v":[{"d":{"df":1,"dc":[[0,1]]}}]},{"k":[101],"v":[{"k":[114],"v":[{"k":[105],"v":[{"k":[97],"v":[{"k":[108],"v":[{"k":[105],"v":[{"k":[122],"v":[{"k":[101],"v":[{"k":[100],"v":[{"d":{"df":1,"dc":[[0,1]]}}]}]}]}]}]}]}]}]}]},{"k":[97],"v":[{"k":[103],"v":[{"k":[101],"v":[{"k":[33],"v":[{"d":{"df":1,"dc":[[0,1]]}}]}]}]}]}]}}}}}],"databaseVersion":1.5,"engineVersion":1.5,"filename":"content.db","_persistenceAdapter":null,"_persistenceMethod":null,"_throttledSaves":true}'
    let nuxt
    let $content

    beforeAll(async () => {
      await fs.writeFile(dbFilePath, mockDbDump)
      nuxt = await init(config)
      await nuxt.listen(await generatePort())
      $content = require('@nuxt/content').$content
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
    })

    test('should use cached db', async () => {
      const item = await $content('about').fetch()

      expect(item).toEqual(expect.objectContaining({
        title: 'Serialized test'
      }))
    })
  })
})
