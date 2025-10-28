export async function decompressSQLDump(base64Str: string, compressionType: CompressionFormat = 'gzip'): Promise<string[]> {
  // Decode Base64 to binary data
  let binaryData: Uint8Array

  // Use platform-appropriate base64 decoding
  if (typeof Buffer !== 'undefined') {
    // Node.js environment (including Vercel)
    const buffer = Buffer.from(base64Str, 'base64')
    // Create a new Uint8Array from the buffer values
    binaryData = Uint8Array.from(buffer)
  }
  else if (typeof atob !== 'undefined') {
    // Browser environment
    binaryData = Uint8Array.from(atob(base64Str), c => c.charCodeAt(0))
  }
  else {
    throw new TypeError('No base64 decoding method available')
  }

  // Create a Response from the Blob and use the DecompressionStream
  const response = new Response(new Blob([binaryData as unknown as ArrayBuffer]))
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType))
  // Parse the decompress text back into an array
  const text = await new Response(decompressedStream).text()
  return JSON.parse(text)
}
