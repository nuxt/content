import { markdownLineEndingOrSpace } from 'micromark-util-character'
import type { Effects, State, TokenizeContext, Code } from 'micromark-util-types'
import { Codes } from './constants'
import createAttributes from './factory-attributes'
import createLabel from './factory-label'
import createName from './factory-name'

const label: any = { tokenize: tokenizeLabel, partial: true }
const attributes: any = { tokenize: tokenizeAttributes, partial: true }

function previous (this: TokenizeContext, code: Code) {
  // If there is a previous code, there will always be a tail.
  return code !== Codes.colon /* `:` */ || this.events[this.events.length - 1][1].type === 'characterEscape'
}

function tokenize (this: TokenizeContext, effects: Effects, ok: State, nok: State) {
  const self = this

  return start

  function start (code: Code): void | State {
    /* istanbul ignore if - handled by mm */
    if (code !== Codes.colon /* `:` */) { throw new Error('expected `:`') }

    if (
      self.previous !== null &&
      !markdownLineEndingOrSpace(self.previous) &&
      ![Codes.openingSquareBracket].includes(self.previous)
    ) {
      return nok(code)
    }

    /* istanbul ignore if - handled by mm */
    if (!previous.call(self, self.previous)) {
      throw new Error('expected correct previous')
    }

    effects.enter('componentText')
    effects.enter('componentTextMarker')
    effects.consume(code)
    effects.exit('componentTextMarker')
    return createName.call(self, effects, afterName as State, nok, 'componentTextName')
  }

  function afterName (code: Code): void | State {
    if (code === Codes.colon /* `:` */) {
      return nok(code)
    }

    // Check for label
    if (code === Codes.openingSquareBracket) {
      return effects.attempt(label, afterLabel as State, afterLabel as State)(code)
    }

    // Check for attributes
    if (code === Codes.openingCurlyBracket) {
      return effects.attempt(attributes, afterAttributes as State, afterAttributes as State)(code)
    }

    return exit(code)
  }

  function afterAttributes (code: Code): void | State {
    // Check for label after attributes
    if (code === Codes.openingSquareBracket) {
      return effects.attempt(label, afterLabel as State, afterLabel as State)(code)
    }

    return exit(code)
  }

  function afterLabel (code: Code): void | State {
    // Check for attributes after label
    if (code === Codes.openingCurlyBracket) {
      return effects.attempt(attributes, exit as State, exit as State)(code)
    }
    return exit(code)
  }

  function exit (code: Code): void | State {
    // Allow everything else to exit the componentText state
    // if (!markdownLineEndingOrSpace(code) && ![Codes.EOF, Codes.closingSquareBracket, Codes.dot, Codes.comma].includes(code)) {
    //   return nok(code)
    // }
    effects.exit('componentText')
    return ok(code)
  }
}

function tokenizeLabel (effects: Effects, ok: State, nok: State) {
  // Always a `[`
  return createLabel(effects, ok, nok, 'componentTextLabel', 'componentTextLabelMarker', 'componentTextLabelString')
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

export default {
  tokenize,
  previous
}
