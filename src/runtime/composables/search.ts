import MiniSearch, { type Options as MiniSearchOptions } from 'minisearch'
import { useRuntimeConfig, useFetch } from '#imports'

export const defineMiniSearchOptions = <DataItem>(options: MiniSearchOptions<DataItem>) => {
  return ref(options)
}

export const useSearch = async <DataItem>(search: MaybeRefOrGetter<string>, options: MiniSearchOptions<DataItem>) => {
  const runtimeConfig = useRuntimeConfig()
  const integrity = runtimeConfig.public.content.integrity
  const baseAPI = runtimeConfig.public.content.api.baseURL
  const useIndexedSearch = runtimeConfig.public.content.search?.indexedSearch ?? false

  if (useIndexedSearch) {
    const { options } = runtimeConfig.public.content.search

    const { data } = await useFetch<string>(`${baseAPI}/indexed-search${integrity ? '-' + integrity : ''}`, { responseType: 'text' }) as unknown as string

    if (!data.value) { return [] }

    const { results } = useIndexedMiniSearch(search, data as unknown as string, options)

    return results
  }

  const { data } = await useFetch<DataItem[]>(`${baseAPI}/search${integrity ? '.' + integrity : ''}.json`)

  if (!data.value) { return [] }

  const { results } = useMiniSearch(search, data as unknown as DataItem[], options)

  return results
}

// Could be moved to @vueuse/integrations if it's useful and efficient
const useIndexedMiniSearch = <DataItem>(search: MaybeRefOrGetter<string>, indexedData: MaybeRefOrGetter<string>, options: MiniSearchOptions<DataItem>) => {
  const createIndexedMiniSearch = () => {
    return MiniSearch.loadJSON(toValue(indexedData), toValue(options))
  }

  const indexedMiniSearch = ref(createIndexedMiniSearch())

  watch(
    () => toValue(options),
    () => { indexedMiniSearch.value = createIndexedMiniSearch() },
    { deep: true }
  )

  watch(
    () => toValue(indexedData),
    () => { indexedMiniSearch.value = createIndexedMiniSearch() },
    { deep: true }
  )

  const results = computed(() => {
    return indexedMiniSearch.value.search(toValue(search))
  })

  return {
    results,
    indexedMiniSearch
  }
}

// Could be moved to @vueuse/integrations if it's useful and efficient
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
