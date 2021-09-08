import { DocusAddonContext } from '../../../types'

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
        // Get addon instance
        const addonInstance = addon(context)

        // Check if key already exists in addons context
        if (addonsContext[key]) {
          // eslint-disable-next-line no-console
          console.warn(`You duplicated the ${key} in Docus context!`)
          return
        }

        // Set addon context key
        addonsContext[key] = addonInstance

        // Init if needed
        if (addonInstance?.init) {
          try {
            await addonInstance.init()
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
