import { createContext } from 'unctx'
import { createStorage, Driver, Storage } from 'unstorage'

const ctx = createContext<Storage>()

ctx.set(createStorage())

export const useStorage = ctx.use

export const mount = async (mountPoint: string, driver: Driver) => {
  const storage = useStorage()
  // TODO: check if driver is already mounted
  await storage?.unmount(mountPoint)
  storage?.mount(mountPoint, driver)
}

export const clear = () => {
  ctx.use()?.dispose()
  ctx.unset()
}
