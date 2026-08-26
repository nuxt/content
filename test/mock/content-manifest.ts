export const tables = {
  test: '_content_test',
  info: '_content_info',
}

export const checksums: Record<string, string> = {}
export const checksumsStructure: Record<string, string> = {}

const manifest: Record<string, { fields: Record<string, string> }> = {
  test: { fields: { id: 'string', title: 'string' } },
}

export default manifest
