// https://github.com/micromark/micromark-extension-directive/blob/main/lib/syntax.js

import directiveSpan from './tokenize-directive-span'
import directiveAttribute from './tokenize-directive-attribute'
import directiveInline from './tokenize-directive-inline'
import directiveContainer from './tokenize-directive-container'
import directiveContainerIndented from './tokenize-directive-container-indented'
import { Codes } from './constants'

export default function directive() {
  return {
    text: {
      [Codes.colon]: directiveInline,
      [Codes.openingSquareBracket]: [directiveSpan],
      [Codes.openingCurlyBracket]: directiveAttribute
    },
    flow: {
      [Codes.colon]: [directiveContainer, directiveInline]
    },
    flowInitial: {
      '-2': directiveContainerIndented,
      '-1': directiveContainerIndented,
      [Codes.space]: directiveContainerIndented
    }
  }
}
