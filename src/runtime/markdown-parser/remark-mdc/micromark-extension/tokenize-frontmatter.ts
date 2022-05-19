import type { Effects, State, TokenizeContext, Code } from 'micromark-util-types'
import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { Codes, SectionSequenceSize } from './constants'
import { linePrefixSize } from './utils'

export function tokenizeFrontMatter (
  effects: Effects,
  ok: State,
  _nok: State,
  next: State,
  initialPrefix: number
) {
  let previous: any

  return effects.attempt({
    tokenize: tokenizeDataSection as any,
    partial: true
  }, dataSectionOpen as State, next as State) as State

  // Look for data section
  function tokenizeDataSection (this: TokenizeContext, effects: Effects, ok: State, nok: State) {
    const self = this
    let size = 0
    let sectionIndentSize = 0

    return closingPrefixAfter

    function dataLineFirstSpaces (code: Code): State | void {
      if (markdownSpace(code)) {
        effects.consume(code)
        sectionIndentSize += 1
        return dataLineFirstSpaces
      }
      effects.exit('space')
      return closingPrefixAfter(code)
    }

    function closingPrefixAfter (code: Code): State | void {
      if (markdownSpace(code)) {
        effects.enter('space')
        return dataLineFirstSpaces(code)
      }
      if (sectionIndentSize === 0) {
        sectionIndentSize = linePrefixSize(self.events)
      }
      effects.enter('componentContainerSectionSequence')
      return closingSectionSequence(code)
    }

    function closingSectionSequence (code: Code): State | void {
      if (code === Codes.dash || markdownSpace(code)) {
        effects.consume(code)
        size++
        return closingSectionSequence
      }

      if (size < SectionSequenceSize) { return nok(code) }
      if (sectionIndentSize !== initialPrefix) { return nok(code) }

      if (!markdownLineEnding(code)) { return nok(code) }

      effects.exit('componentContainerSectionSequence')
      return factorySpace(effects, ok, 'whitespace')(code)
    }
  }

  /**
   * Enter data section
   */
  function dataSectionOpen (code: Code): State | void {
    effects.enter('componentContainerDataSection')
    return effects.attempt({
      tokenize: tokenizeDataSection as any,
      partial: true
    }, dataSectionClose as State, dataChunkStart as State)(code)
  }

  /**
   *  Data section line
   */
  function dataChunkStart (code: Code): State | void {
    if (code === null) {
      effects.exit('componentContainerDataSection')
      effects.exit('componentContainer')
      return ok(code)
    }

    // @ts-ignore
    const token = effects.enter('chunkDocument', {
      contentType: 'document',
      previous
    })
    if (previous) { previous.next = token }
    previous = token
    return dataContentContinue(code)
  }

  /**
   * Data section content
   */
  function dataContentContinue (code: Code): State | void {
    if (code === null) {
      effects.exit('chunkDocument')
      effects.exit('componentContainerDataSection')
      effects.exit('componentContainer')
      return ok(code)
    }

    if (markdownLineEnding(code)) {
      effects.consume(code)
      effects.exit('chunkDocument')
      return effects.attempt({
        tokenize: tokenizeDataSection as any,
        partial: true
      }, dataSectionClose as State, dataChunkStart as State)
    }

    effects.consume(code)
    return dataContentContinue
  }

  /**
   * Exit data section
   */
  function dataSectionClose (code: Code): State | void {
    effects.exit('componentContainerDataSection')
    return factorySpace(effects, next, 'whitespace')(code)
  }
}
