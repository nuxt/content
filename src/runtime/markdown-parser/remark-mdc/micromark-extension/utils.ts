import type { Effects } from 'micromark-factory-space'

// Measure the number of character codes in chunks.
// Counts tabs based on their expanded size, and CR+LF as one character.
export function sizeChunks (chunks: any[]) {
  let index = -1
  let size = 0

  while (++index < chunks.length) {
    size += typeof chunks[index] === 'string' ? chunks[index].length : 1
  }

  return size
}

export function prefixSize (events: any, type: string) {
  const tail = events[events.length - 1]
  if (!tail || tail[1].type !== type) { return 0 }
  return sizeChunks(tail[2].sliceStream(tail[1]))
}

/**
 * Calculate line indention size, line indention could be consists of multiple `linePrefix` events
 * @param events parser tokens
 * @returns line indention size
 */
export function linePrefixSize (events: any[]) {
  let size = 0
  let index = events.length - 1
  let tail = events[index]
  while (index >= 0 && tail && tail[1].type === 'linePrefix' && tail[0] === 'exit') {
    size += sizeChunks(tail[2].sliceStream(tail[1]))
    index -= 1
    tail = events[index]
  }

  return size
}

/**
 * Manage token state
 */
export const useTokenState = (tokenName: string) => {
  const token = {
    isOpen: false,
    /**
     * Enter into token, close previous open token if any
     */
    enter: (effects: Effects) => {
      const initialState = token.isOpen
      token.exit(effects)
      effects.enter(tokenName)
      token.isOpen = true

      // Revert to initial state
      return () => {
        token.isOpen = initialState
      }
    },
    /**
     * Enter into token only once, if token is already open, do nothing
     */
    enterOnce: (effects: Effects) => {
      const initialState = token.isOpen

      if (!token.isOpen) {
        effects.enter(tokenName)
        token.isOpen = true
      }

      // Revert to initial state
      return () => {
        token.isOpen = initialState
      }
    },
    /**
     * Exit from token if it is open
     */
    exit: (effects: Effects) => {
      const initialState = token.isOpen
      if (token.isOpen) {
        effects.exit(tokenName)
        token.isOpen = false
      }

      // Revert to initial state
      return () => {
        token.isOpen = initialState
      }
    }
  }
  return token
}
