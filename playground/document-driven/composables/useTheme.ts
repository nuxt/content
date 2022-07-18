import { useContent } from '#imports'

export const useTheme = () => {
  const { globals } = useContent()

  const theme = computed(() => globals.value?.theme)

  return theme
}
