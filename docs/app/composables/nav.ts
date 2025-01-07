import colors from 'tailwindcss/colors'

export const useNavLinks = () => {
  const route = useRoute()

  return computed(() => [{
    label: 'Documentation',
    icon: 'i-lucide-book-open',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs'),
  }, {
    label: 'Studio',
    icon: 'i-lucide-file-pen-line',
    children: [{
      icon: 'i-lucide-mouse-pointer-click',
      label: 'Features',
      description: 'Everything you need to edit your Nuxt Content project',
      to: '/studio',
    }, {
      label: 'Pricing',
      description: 'Free for personal use, paid plans for teams',
      icon: 'i-lucide-rocket',
      to: '/studio/pricing',
    }],
  }, {
    label: 'Templates',
    icon: 'i-lucide-panels-top-left',
    to: '/templates',
  }, {
    label: 'Blog',
    icon: 'i-lucide-file-text',
    to: '/blog',
  }, {
    label: 'Changelog',
    icon: 'i-lucide-history',
    to: '/changelog',
  }])
}

export const useThemeColor = () => {
  const colorMode = useColorMode()
  const appConfig = useAppConfig()

  return computed(() => colorMode.value === 'dark' ? colors[appConfig.ui.colors.neutral as keyof typeof colors][900] : 'white')
}
