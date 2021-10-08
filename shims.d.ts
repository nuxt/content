declare namespace NodeJS {
  interface Process {
    dev: boolean
    client: boolean
    server: boolean
    options: any
    previewUrl: string
  }
}
