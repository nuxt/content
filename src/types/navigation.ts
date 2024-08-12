export interface ContentNavigationItem {
  title: string
  path: string
  stem: string
  children?: ContentNavigationItem[]
}

export interface PageDocument {
  title: string
  path: string
  stem: string
  [key: string]: any
}
