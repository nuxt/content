export type GitRepositoryType = {
  url: string
  branch?: GitRefType['branch']
  tag?: GitRefType['tag']
  auth?: GitBasicAuth | GitTokenAuth
}

export type GitRefType = {
  branch?: string
  tag?: string
}

export type GitBasicAuth = {
  username?: string
  password?: string
}

export type GitTokenAuth = {
  username?: string
  token?: string
}
