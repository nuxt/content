export const formatDateByLocale = (d: string | number | Date, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }) => {
  return new Date(d).toLocaleDateString('en', options)
}

export const TEMPLATE_BADGES = {
  'free': {
    color: 'secondary' as const,
    label: 'Free',
  },
  'nuxt-ui-pro': {
    color: 'primary' as const,
    label: 'Nuxt UI Pro',
  },
}
