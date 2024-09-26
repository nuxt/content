export interface ContentNavigationItem {
  title: string
  path: string
  stem: string
  children?: ContentNavigationItem[]
  page?: false
}
