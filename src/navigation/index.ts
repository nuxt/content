import { Nuxt } from '@nuxt/kit'
import { useStorage } from '../storage/storage'
import { generateNavigation } from './navigation'

export async function index(nuxt: Nuxt) {
  const navigation = await generateNavigation(nuxt)

  const storage = useStorage()
  storage?.setItem('data:docus:navigation', navigation as any)
  Object.entries(navigation).forEach(([key, nav]) => {
    storage?.setItem(`data:docus:navigation:${key}`, nav as any)
  })
}
