import colors from 'tailwindcss/colors'

export const useNavLinks = () => {
  const route = useRoute()

  return computed(() => [{
    label: 'Documentation',
    icon: 'i-lucide-book',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs'),
  }])
}

export const useThemeColor = () => {
  const colorMode = useColorMode()
  const appConfig = useAppConfig()

  return computed(() => colorMode.value === 'dark' ? colors[appConfig.ui.colors.neutral as keyof typeof colors][900] : 'white')
}
