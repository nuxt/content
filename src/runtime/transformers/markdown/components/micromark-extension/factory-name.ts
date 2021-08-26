import type { Effects, State } from 'micromark-util-types'
import { asciiAlpha, asciiAlphanumeric } from 'micromark-util-character'

export default function createName(effects: Effects, ok: State, nok: State, nameType: string) {
  // @ts-ignore
  const self = this

  return start

  function start(code: number) {
    if (asciiAlpha(code)) {
      effects.enter(nameType)
      effects.consume(code)
      return name
    }

    return nok(code)
  }

  function name(code: number) {
    if (code === 45 /* `-` */ || code === 95 /* `_` */ || asciiAlphanumeric(code)) {
      effects.consume(code)
      return name
    }

    effects.exit(nameType)
    // To do next major: disallow `-` at end of name too, for consistency.
    return self.previous === 95 /* `_` */ ? nok(code) : ok(code)
  }
}
