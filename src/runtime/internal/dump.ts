export async function decompressSQLDump(base64Str: string, compressionType: CompressionFormat = 'gzip'): Promise<string> {
  // Decode Base64 to binary data
  const binaryData = Uint8Array.from(atob(base64Str), c => c.charCodeAt(0))

  // Create a Response from the Blob and use the DecompressionStream
  const response = new Response(new Blob([binaryData]))
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType))
  // Read the decompressed data as text
  return new Response(decompressedStream).text()
}
