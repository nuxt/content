import MiniSearch, { type Options as MiniSearchOptions } from 'minisearch'
import { UseFetchOptions } from 'nuxt/app'
import { useRuntimeConfig, useFetch } from '#imports'

export const defineMiniSearchOptions = <DataItem>(options: MiniSearchOptions<DataItem>) => {
  return ref(options)
}

export const searchContent = async <DataItem>(search: MaybeRefOrGetter<string>, options: { miniSearch?: MaybeRefOrGetter<MiniSearchOptions<DataItem>>, fetch?: MaybeRefOrGetter<UseFetchOptions<string | DataItem[]>> } = {}) => {
  const runtimeConfig = useRuntimeConfig()
  const { content } = runtimeConfig.public
  const { integrity, api: { baseURL: baseAPI }, search: searchOptions } = content
  const { indexedSearch: useIndexedSearch } = searchOptions || {}

  if (useIndexedSearch) {
    const { options: miniSearchOptions } = searchOptions || {}

    const { data } = await useFetch<string>(`${baseAPI}/indexed-search${integrity ? '-' + integrity : ''}`, { responseType: 'text', ...options.fetch as MaybeRefOrGetter<UseFetchOptions<string>> | undefined })

    // We need for a computed since user can have a lazy fetch.
    return computed(() => {
      if (!data.value) {
        return '[]'
      }

      const { results } = useIndexedMiniSearch(search, data as Ref<string>, miniSearchOptions!)

      return results.value
    })
  }

  const { data } = await useFetch<DataItem[]>(`${baseAPI}/search${integrity ? '.' + integrity : ''}.json`, options.fetch as MaybeRefOrGetter<UseFetchOptions<DataItem[]>> | undefined)

  // We need for a computed since user can have a lazy fetch.
  return computed(() => {
    if (!data.value) {
      return []
    }

    if (!options.miniSearch) {
      throw new Error('You must provide a miniSearch option to searchContent if you don\'t use indexed search')
    }

    const { results } = useMiniSearch(search, data as Ref<DataItem[]>, options.miniSearch)

    return results.value
  })
}

// Could be moved to @vueuse/integrations if it's useful and efficient
const useIndexedMiniSearch = <DataItem>(search: MaybeRefOrGetter<string>, indexedData: MaybeRefOrGetter<string>, options: MaybeRefOrGetter<MiniSearchOptions<DataItem>>) => {
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
