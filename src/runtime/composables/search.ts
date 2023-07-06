import { UseFuseOptions, useFuse } from '@vueuse/integrations/useFuse'
import { useRuntimeConfig, useFetch } from '#imports'

export const useSearch = async <DataItem>(query: MaybeRefOrGetter<string>, options: MaybeRefOrGetter<UseFuseOptions<DataItem>>) => {
  const runtimeConfig = useRuntimeConfig()
  const integrity = runtimeConfig.public.content.integrity
  const baseAPI = runtimeConfig.public.content.api.baseURL

  const { data } = await useFetch<DataItem[]>(`${baseAPI}/search${integrity ? '.' + integrity : ''}.json`)

  if (!data.value) { return [] }

  const { results } = useFuse(query, data as unknown as DataItem[], options)

  return results
}
