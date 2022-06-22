import { useDocumentDriven } from '#imports'

export const useTheme = () => {
  const { globals } = useDocumentDriven()

  const theme = computed(() => globals.value?.theme)

  return theme
}
