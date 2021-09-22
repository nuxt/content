declare namespace NodeJS {
  interface Process {
    dev: boolean
    options: any
    previewUrl: string
  }
}

interface Window {
  onNuxtReady: any
}
