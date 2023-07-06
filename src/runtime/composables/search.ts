import { useFuse } from '@vueuse/integrations/useFuse'
import { useRuntimeConfig, useLazyFetch } from '#imports'

export const useSearch = async (query: string) => {
  const baseAPI = useRuntimeConfig().public.content.api.baseURL

  // TODO: find a way to avoid fetching every time all the content
  const { data } = await useLazyFetch(`${baseAPI}/search`)

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
