import { inflate } from 'pako'

function convertDataURIToBinary(base64: string) {
  const raw = atob(base64)
  const rawLength = raw.length
  const array = new Uint8Array(new ArrayBuffer(rawLength))

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i)
  }
  return array
}

export function decompressSQLDump(dump: string) {
  return JSON.parse(
    inflate(
      convertDataURIToBinary(dump),
      { to: 'string' },
    ),
  )
}
