export async function decompressSQLDump(dump: string): Promise<string[]> {
  return import('pako').then(m => m.inflate(convertDataURIToBinary(dump), { to: 'string' }).split('\n'))
}

function convertDataURIToBinary(base64: string) {
  const raw = atob(base64)
  const rawLength = raw.length
  const array = new Uint8Array(new ArrayBuffer(rawLength))

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i)
  }
  return array
}
