import { DocusAddonContext } from '../../../index.d'

type DocusAddons = {
  [key: string]: any
}

export const useDocusAddons = (context: DocusAddonContext, addons: DocusAddons) => {
  /**
   * Addons context to be spread into Docus injection
   */
  const addonsContext: any = {}

  /**
   * Setup all addons
   */
  const setupAddons = async () =>
    await Promise.all(
      Object.entries(addons).map(async ([key, addon]) => {
        const addonKeys = addon(context)

        Object.entries(addonKeys).forEach(([key, value]) => {
          if (key === 'init') return

          const contextKeys = [Object.keys(addonsContext), ...Object.keys(context.state)]

          // eslint-disable-next-line no-console
          if (contextKeys.includes(key)) console.warn(`You duplicated the key ${key} in Docus context.`)

          addonsContext[key] = value
        })

        if ((addonKeys as any)?.init) {
          try {
            await addonKeys?.init?.()
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log(`Could not init ${key} addon!`)
          }
        }
      })
    )

  return {
    addonsContext,
    setupAddons
  }
}
