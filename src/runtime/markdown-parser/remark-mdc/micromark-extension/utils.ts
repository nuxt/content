// Measure the number of character codes in chunks.
// Counts tabs based on their expanded size, and CR+LF as one character.
export function sizeChunks(chunks: any[]) {
  let index = -1
  let size = 0

  while (++index < chunks.length) {
    size += typeof chunks[index] === 'string' ? chunks[index].length : 1
  }

  return size
}

export function prefixSize(events: any, type: string) {
  const tail = events[events.length - 1]
  if (!tail || tail[1].type !== type) return 0
  return sizeChunks(tail[2].sliceStream(tail[1]))
}
