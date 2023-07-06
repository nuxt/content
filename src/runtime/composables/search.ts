import MiniSearch, { type Options as MiniSearchOptions } from 'minisearch'
import { useRuntimeConfig, useFetch } from '#imports'

export const defineMiniSearchOptions = <DataItem>(options: MiniSearchOptions<DataItem>) => {
  return ref(options)
}

export const useSearch = async <DataItem>(search: MaybeRefOrGetter<string>, options: MiniSearchOptions<DataItem>) => {
  const runtimeConfig = useRuntimeConfig()
  const integrity = runtimeConfig.public.content.integrity
  const baseAPI = runtimeConfig.public.content.api.baseURL

  const { data } = await useFetch<DataItem[]>(`${baseAPI}/search${integrity ? '.' + integrity : ''}.json`)

  if (!data.value) { return [] }

  const { results } = useMiniSearch(search, data as unknown as DataItem[], options)

  return results
}

// Could be move to @vueuse/integrations if it's useful and efficient
const useMiniSearch = function <T = any> (search: MaybeRefOrGetter<string>, data: MaybeRefOrGetter<T[]>, options: MaybeRefOrGetter<MiniSearchOptions<T>>) {
  const createMiniSearch = () => {
    return new MiniSearch(toValue(options))
  }

  const miniSearch = ref(createMiniSearch())

  miniSearch.value.addAll(toValue(data))

  watch(
    () => toValue(options),
    () => { miniSearch.value = createMiniSearch() },
    { deep: true }
  )

  watch(
    () => toValue(data),
    (newData) => {
      miniSearch.value.removeAll()
      miniSearch.value.addAll(newData)
    },
    { deep: true }
  )

  const results = computed(() => {
    return miniSearch.value.search(toValue(search))
  })

  return {
    results,
    miniSearch
  }
}
