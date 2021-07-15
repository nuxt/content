import { Effects, Okay, NotOkay } from 'micromark/dist/shared-types'
import asciiAlpha from 'micromark/dist/character/ascii-alpha'
import asciiAlphanumeric from 'micromark/dist/character/ascii-alphanumeric'

export default function createName(effects: Effects, ok: Okay, nok: NotOkay, nameType: string) {
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
