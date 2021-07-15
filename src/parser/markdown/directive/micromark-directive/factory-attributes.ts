import { Effects, Okay, NotOkay } from 'micromark/dist/shared-types'
import asciiAlpha from 'micromark/dist/character/ascii-alpha'
import asciiAlphanumeric from 'micromark/dist/character/ascii-alphanumeric'
import markdownLineEnding from 'micromark/dist/character/markdown-line-ending'
import markdownLineEndingOrSpace from 'micromark/dist/character/markdown-line-ending-or-space'
import markdownSpace from 'micromark/dist/character/markdown-space'
import createWhitespace from 'micromark/dist/tokenize/factory-whitespace'
import createSpace from 'micromark/dist/tokenize/factory-space'

export default function createAttributes(
  effects: Effects,
  ok: Okay,
  nok: NotOkay,
  attributesType: string,
  attributesMarkerType: string,
  attributeType: string,
  attributeIdType: string,
  attributeClassType: string,
  attributeNameType: string,
  attributeInitializerType: string,
  attributeValueLiteralType: string,
  attributeValueType: string,
  attributeValueMarker: string,
  attributeValueData: string,
  disallowEol?: boolean
) {
  let type
  let marker

  return start

  function start(code: number) {
    // Always a `{`
    effects.enter(attributesType)
    effects.enter(attributesMarkerType)
    effects.consume(code)
    effects.exit(attributesMarkerType)
    return between
  }

  function between(code: number) {
    if (code === 35 /* `#` */) {
      type = attributeIdType
      return shortcutStart(code)
    }

    if (code === 46 /* `.` */) {
      type = attributeClassType
      return shortcutStart(code)
    }

    if (code === 58 /* `:` */ || code === 95 /* `_` */ || asciiAlpha(code)) {
      effects.enter(attributeType)
      effects.enter(attributeNameType)
      effects.consume(code)
      return name
    }

    if (disallowEol && markdownSpace(code)) {
      return createSpace(effects, between, 'whitespace')(code)
    }

    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return createWhitespace(effects, between)(code)
    }

    return end(code)
  }

  function shortcutStart(code: number) {
    effects.enter(attributeType)
    effects.enter(type)
    effects.enter(type + 'Marker')
    effects.consume(code)
    effects.exit(type + 'Marker')
    return shortcutStartAfter
  }

  function shortcutStartAfter(code: number) {
    if (
      code === null /* EOF */ ||
      code === 34 /* `"` */ ||
      code === 35 /* `#` */ ||
      code === 39 /* `'` */ ||
      code === 46 /* `.` */ ||
      code === 60 /* `<` */ ||
      code === 61 /* `=` */ ||
      code === 62 /* `>` */ ||
      code === 96 /* `` ` `` */ ||
      code === 125 /* `}` */ ||
      markdownLineEndingOrSpace(code)
    ) {
      return nok(code)
    }

    effects.enter(type + 'Value')
    effects.consume(code)
    return shortcut
  }

  function shortcut(code: number) {
    if (
      code === null /* EOF */ ||
      code === 34 /* `"` */ ||
      code === 39 /* `'` */ ||
      code === 60 /* `<` */ ||
      code === 61 /* `=` */ ||
      code === 62 /* `>` */ ||
      code === 96 /* `` ` `` */
    ) {
      return nok(code)
    }

    if (code === 35 /* `#` */ || code === 46 /* `.` */ || code === 125 /* `}` */ || markdownLineEndingOrSpace(code)) {
      effects.exit(type + 'Value')
      effects.exit(type)
      effects.exit(attributeType)
      return between(code)
    }

    effects.consume(code)
    return shortcut
  }

  function name(code: number) {
    if (
      code === 45 /* `-` */ ||
      code === 46 /* `.` */ ||
      code === 58 /* `:` */ ||
      code === 95 /* `_` */ ||
      asciiAlphanumeric(code)
    ) {
      effects.consume(code)
      return name
    }

    effects.exit(attributeNameType)

    if (disallowEol && markdownSpace(code)) {
      return createSpace(effects, nameAfter, 'whitespace')(code)
    }

    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return createWhitespace(effects, nameAfter)(code)
    }

    return nameAfter(code)
  }

  function nameAfter(code: number) {
    if (code === 61 /* `=` */) {
      effects.enter(attributeInitializerType)
      effects.consume(code)
      effects.exit(attributeInitializerType)
      return valueBefore
    }

    // Attribute w/o value.
    effects.exit(attributeType)
    return between(code)
  }

  function valueBefore(code: number) {
    if (
      code === null /* EOF */ ||
      code === 60 /* `<` */ ||
      code === 61 /* `=` */ ||
      code === 62 /* `>` */ ||
      code === 96 /* `` ` `` */ ||
      code === 125 /* `}` */ ||
      (disallowEol && markdownLineEnding(code))
    ) {
      return nok(code)
    }

    if (code === 34 /* `"` */ || code === 39 /* `'` */) {
      effects.enter(attributeValueLiteralType)
      effects.enter(attributeValueMarker)
      effects.consume(code)
      effects.exit(attributeValueMarker)
      marker = code
      return valueQuotedStart
    }

    if (disallowEol && markdownSpace(code)) {
      return createSpace(effects, valueBefore, 'whitespace')(code)
    }

    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return createWhitespace(effects, valueBefore)(code)
    }

    effects.enter(attributeValueType)
    effects.enter(attributeValueData)
    effects.consume(code)
    marker = undefined
    return valueUnquoted
  }

  function valueUnquoted(code: number) {
    if (
      code === null /* EOF */ ||
      code === 34 /* `"` */ ||
      code === 39 /* `'` */ ||
      code === 60 /* `<` */ ||
      code === 61 /* `=` */ ||
      code === 62 /* `>` */ ||
      code === 96 /* `` ` `` */
    ) {
      return nok(code)
    }

    if (code === 125 /* `}` */ || markdownLineEndingOrSpace(code)) {
      effects.exit(attributeValueData)
      effects.exit(attributeValueType)
      effects.exit(attributeType)
      return between(code)
    }

    effects.consume(code)
    return valueUnquoted
  }

  function valueQuotedStart(code: number) {
    if (code === marker) {
      effects.enter(attributeValueMarker)
      effects.consume(code)
      effects.exit(attributeValueMarker)
      effects.exit(attributeValueLiteralType)
      effects.exit(attributeType)
      return valueQuotedAfter
    }

    effects.enter(attributeValueType)
    return valueQuotedBetween(code)
  }

  function valueQuotedBetween(code: number) {
    if (code === marker) {
      effects.exit(attributeValueType)
      return valueQuotedStart(code)
    }

    if (code === null /* EOF */) {
      return nok(code)
    }

    // Note: blank lines can’t exist in content.
    if (markdownLineEnding(code)) {
      return disallowEol ? nok(code) : createWhitespace(effects, valueQuotedBetween)(code)
    }

    effects.enter(attributeValueData)
    effects.consume(code)
    return valueQuoted
  }

  function valueQuoted(code: number) {
    if (code === marker || code === null /* EOF */ || markdownLineEnding(code)) {
      effects.exit(attributeValueData)
      return valueQuotedBetween(code)
    }

    effects.consume(code)
    return valueQuoted
  }

  function valueQuotedAfter(code: number) {
    return code === 125 /* `}` */ || markdownLineEndingOrSpace(code) ? between(code) : end(code)
  }

  function end(code: number) {
    if (code === 125 /* `}` */) {
      effects.enter(attributesMarkerType)
      effects.consume(code)
      effects.exit(attributesMarkerType)
      effects.exit(attributesType)
      return ok
    }

    return nok(code)
  }
}
