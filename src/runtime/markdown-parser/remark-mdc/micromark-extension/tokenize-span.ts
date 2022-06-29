import { markdownSpace } from 'micromark-util-character'
import type { Effects, State, Code, TokenizeContext } from 'micromark-util-types'
import { Codes } from './constants'
import createLabel from './factory-label'
import createAttributes from './factory-attributes'

const label: any = { tokenize: tokenizeLabel, partial: true }
const gfmCheck: any = { tokenize: checkGfmTaskCheckbox, partial: true }
const attributes: any = { tokenize: tokenizeAttributes, partial: true }

function tokenize (this: TokenizeContext, effects: Effects, ok: State, nok: State) {
  const self = this
  return start

  function start (code: Code): void | State {
    if (code !== Codes.openingSquareBracket) {
      throw new Error('expected `[`')
    }

    // When we are in the beggining of task list line,
    // there is a good chance that we are dealing with a GFM task list
    if (
      self.previous === Codes.EOF &&
      self._gfmTasklistFirstContentOfListItem
    ) {
      return effects.check(gfmCheck, nok, attemptLabel)(code)
    }

    return attemptLabel(code)
  }

  function attemptLabel (code: Code): void | State {
    effects.enter('textSpan')
    return effects.attempt(label, exit as State, nok)(code)
  }

  function exit (code: Code): void | State {
    // Prevent conflict with link syntax
    if (code === Codes.openingParentheses || code === Codes.openingSquareBracket) {
      return nok(code)
    }
    // Attemp parsing attributes
    if (code === Codes.openingCurlyBracket) {
      return effects.attempt(attributes, exitOK, exitOK)(code)
    }

    return exitOK(code)
  }

  function exitOK (code: Code): void | State {
    effects.exit('textSpan')
    return ok(code)
  }
}

/**
 * Labels starts with `[` and ends with `]`
 */
function tokenizeLabel (effects: Effects, ok: State, nok: State) {
  return createLabel(effects, ok, nok, 'componentTextLabel', 'componentTextLabelMarker', 'componentTextLabelString')
}

export default {
  tokenize
}

function checkGfmTaskCheckbox (effects: Effects, ok: State, nok: State) {
  return enter

  function enter (code: Code): void | State {
    effects.enter('formGfmTaskCheckbox')
    effects.consume(code)
    return check
  }

  function check (code: Code): void | State {
    if (markdownSpace(code)) {
      effects.consume(code)
      return check
    }
    if (code === Codes.uppercaseX || code === Codes.lowercaseX) {
      effects.consume(code)
      return check
    }

    if (code === Codes.closingSquareBracket) {
      effects.exit('formGfmTaskCheckbox')
      return ok(code)
    }

    return nok(code)
  }
}

function tokenizeAttributes (effects: Effects, ok: State, nok: State) {
  // Always a `{`
  return createAttributes(
    effects,
    ok,
    nok,
    'componentTextAttributes',
    'componentTextAttributesMarker',
    'componentTextAttribute',
    'componentTextAttributeId',
    'componentTextAttributeClass',
    'componentTextAttributeName',
    'componentTextAttributeInitializerMarker',
    'componentTextAttributeValueLiteral',
    'componentTextAttributeValue',
    'componentTextAttributeValueMarker',
    'componentTextAttributeValueData'
  )
}
