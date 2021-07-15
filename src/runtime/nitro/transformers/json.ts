export default function transformJSON(_id: string, input: string | object) {
  if (typeof input === 'string') {
    return { body: JSON.parse(input) }
  }
  return { body: input }
}
