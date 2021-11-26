export default function transformJSON(_id: string, input: string | object) {
  // If input is a string, returns it as parsed JSON
  if (typeof input === 'string') return { body: JSON.parse(input), meta: {} }
  // Return body as it is
  return { body: input, meta: {} }
}
