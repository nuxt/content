import { UseFuseOptions, useFuse } from '@vueuse/integrations/useFuse'
import { useRuntimeConfig, useLazyFetch } from '#imports'

export const useSearch = async <DataItem>(query: MaybeRefOrGetter<string>, options: MaybeRefOrGetter<UseFuseOptions<DataItem>>) => {
  const runtimeConfig = useRuntimeConfig()
  const integrity = runtimeConfig.public.content.integrity
  const baseAPI = runtimeConfig.public.content.api.baseURL

  const { data } = await useLazyFetch(`${baseAPI}/search${integrity ? '.' + integrity : ''}.json`)

  const { results } = useFuse(query, data, options)

  return results
}
