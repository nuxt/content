import type { Effects, State, Code } from 'micromark-util-types'
import { Codes } from './constants'
import createLabel from './factory-label'

const label: any = { tokenize: tokenizeLabel, partial: true }

function tokenize(effects: Effects, ok: State, nok: State) {
  return start

  function start(code: Code) {
    if (code !== Codes.openingSquareBracket) {
      throw new Error('expected `[`')
    }

    effects.enter('textSpan')
    return effects.attempt(label, exit as State, nok)(code)
  }

  function exit(code: Code) {
    // prevent conflict with link syntax
    if (code === Codes.openingParentheses) {
      return nok(code)
    }
    effects.exit('textSpan')
    return ok(code)
  }
}

/**
 * Labels starts with `[` and ends with `]`
 */
function tokenizeLabel(effects: Effects, ok: State, nok: State) {
  return createLabel(effects, ok, nok, 'componentTextLabel', 'componentTextLabelMarker', 'componentTextLabelString')
}

export default {
  tokenize
}
