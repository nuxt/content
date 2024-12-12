import colors from 'tailwindcss/colors'

export const useNavLinks = () => {
  const route = useRoute()

  return computed(() => [{
    label: 'Documentation',
    icon: 'i-lucide-book',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs'),
  }, {
    label: 'Studio',
    icon: 'i-lucide-book',
    children: [{
      label: 'Features',
      icon: 'i-lucide-file-pen-line',
      to: '/studio',
    }, {
      label: 'Pricing',
      icon: 'i-lucide-rocket',
      to: '/studio/pricing',
    }, {
      label: 'Templates',
      icon: 'i-lucide-panels-top-left',
      to: '/studio/templates',
    }],
  }, {
    label: 'Blog',
    icon: 'i-lucide-book',
    to: '/blog',
  }, {
    label: 'Changelog',
    icon: 'i-lucide-book',
    to: '/changelog',
  }])
}

export const useThemeColor = () => {
  const colorMode = useColorMode()
  const appConfig = useAppConfig()

  return computed(() => colorMode.value === 'dark' ? colors[appConfig.ui.colors.neutral as keyof typeof colors][900] : 'white')
}
