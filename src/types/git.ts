export type GitRefType = {
  branch?: string
  commit?: string
  tag?: string
}

export type GitBasicAuth = {
  username?: string
  password: string
}

export type GitTokenAuth = {
  username?: string
  authToken: string
}
