import { Effects, Okay, NotOkay } from 'micromark/dist/shared-types'
import { Codes } from './constants'
import createLabel from './factory-label'

const label: any = { tokenize: tokenizeLabel, partial: true }

function tokenize(effects: Effects, ok: Okay, nok: NotOkay) {
  return start

  function start(code: number) {
    if (code !== Codes.openingSquareBracket) {
      throw new Error('expected `[`')
    }

    effects.enter('directiveTextSpan')
    return effects.attempt(label, exit, nok)(code)
  }

  function exit(code: number) {
    // prevent conflict with link syntax
    if (code === Codes.openingParentheses) {
      return nok(code)
    }
    effects.exit('directiveTextSpan')
    return ok(code)
  }
}

/**
 * Labels starts with `[` and ends with `]`
 */
function tokenizeLabel(effects: Effects, ok: Okay, nok: NotOkay) {
  return createLabel(effects, ok, nok, 'directiveTextLabel', 'directiveTextLabelMarker', 'directiveTextLabelString')
}

export default {
  tokenize
}
