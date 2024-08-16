export interface ContentNavigationItem {
  title: string
  path: string
  stem: string
  children?: ContentNavigationItem[]
  page?: false
}

export interface PageDocument {
  title: string
  path: string
  stem: string
  [key: string]: any
}

export interface SurroundOptions<T> {
  before?: number
  after?: number
  fields?: Array<T>
}
