import { useFuse } from '@vueuse/integrations/useFuse'
import { toValue } from '@vueuse/shared'
import { useRuntimeConfig, useLazyFetch } from '#imports'

export const useSearch = async (query: MaybeRefOrGetter<string>) => {
  const baseAPI = useRuntimeConfig().public.content.api.baseURL

  const { data } = await useLazyFetch(`${baseAPI}/search.json`)

  // TODO: add a way to configure the search (using options from search?)
  const { results } = useFuse(query,
    data,
    {
      fuseOptions: {
        keys: [
          'title',
          'description',
          'keywords',
          'body'
        ],
        ignoreLocation: true,
        threshold: 0,
        includeMatches: true,
        includeScore: true
      },
      matchAllWhenSearchEmpty: true
    }
  )

  return results
}
