import { defineDriver, createStorage, builtinDrivers, normalizeKey } from 'unstorage'

export default defineDriver((_opts) => {
  const defaultOptions = {
    alias: _opts.fileName
  }
  const opts = { ...defaultOptions, ..._opts }
  opts.alias = normalizeKey(opts.alias)

  const storageInstance = createStorage()

  const initDriver = async () => {
    const driverPath = builtinDrivers[opts.sourceDriver] || opts.sourceDriver
    const driver = await import(driverPath).then(d => d.default || d)
    storageInstance.mount('/', driver(opts))
  }
  const initPromise = initDriver()

  return {
    getKeys () {
      return Promise.resolve([opts.alias])
    },
    hasItem (key) {
      return Promise.resolve(key === opts.alias)
    },
    async getItem (key) {
      await initPromise

      if (key === opts.alias) {
        return storageInstance.getItem(opts.fileName)
      }

      return null
    },
    async getMeta (key) {
      await initPromise

      if (key === opts.alias) {
        return storageInstance.getMeta(opts.fileName)
      }

      return null
    },
    async setItem (key, value) {
      await initPromise

      if (key === opts.alias) {
        return storageInstance.setItem(opts.fileName, value)
      }
    }
  }
})
