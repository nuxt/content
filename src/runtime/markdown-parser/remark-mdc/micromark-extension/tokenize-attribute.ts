import type { Effects, State, Code, TokenizeContext } from 'micromark-util-types'
import { markdownLineEnding } from 'micromark-util-character'
import { Codes } from './constants'
import createAttributes from './factory-attributes'

const attributes: any = { tokenize: tokenizeAttributes, partial: true }

const validEvents = [
  /**
   * Span
   */
  'textSpan',
  /**
   * Bold & Italic
   */
  'attentionSequence',
  /**
   * Inline Code
   */
  'codeText',
  /**
   * Link
   */
  'link',
  /**
   * Image
   */
  'image'
]

function tokenize (this: TokenizeContext, effects: Effects, ok: State, nok: State) {
  const self = this

  return start

  function start (code: Code): void | State {
    if (code !== Codes.openingCurlyBracket) { throw new Error('expected `{`') }

    /**
     * Make sure sytax is used after valid tags
     */
    const event = self.events[self.events.length - 1]
    if (markdownLineEnding(self.previous) || !event || !validEvents.includes(event[1].type)) {
      return nok
    }

    return effects.attempt(attributes, ok, nok)(code)
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

export default {
  tokenize
}
