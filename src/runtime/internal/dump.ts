export async function decompressSQLDump(base64Str: string, compressionType: CompressionFormat = 'gzip'): Promise<string[]> {
  // Decode Base64 to binary data
  const binaryData = Uint8Array.from(atob(base64Str), c => c.charCodeAt(0))

  // Create a Response from the Blob and use the DecompressionStream
  const response = new Response(new Blob([binaryData]))
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType))
  // Parse the decompress text back into an array
  const text = await new Response(decompressedStream).text()
  return JSON.parse(text)
}
