import { Nuxt } from '@nuxt/kit'
import { useStorage } from '../storage'
import { generateNavigation } from './navigation'

export async function updateNavigation(nuxt: Nuxt) {
  const navigation = await generateNavigation(nuxt)

  const storage = useStorage()
  storage?.setItem('data:docus:navigation', {
    body: navigation as any
  })
  Object.entries(navigation).forEach(([key, nav]) => {
    storage?.setItem(`data:docus:navigation:${key}`, {
      body: nav as any
    })
  })
}
