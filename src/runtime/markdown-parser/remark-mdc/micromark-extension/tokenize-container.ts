import type { Effects, State, Code, TokenizeContext } from 'micromark-util-types'
import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding, asciiAlpha, markdownSpace } from 'micromark-util-character'
import { linePrefixSize, useTokenState } from './utils'
import { Codes, ContainerSequenceSize, slotSeparatorCode, slotSeparatorLength } from './constants'
import createName from './factory-name'
import createLabel from './factory-label'
import createAttributes from './factory-attributes'
import { tokenizeFrontMatter } from './tokenize-frontmatter'

const label: any = { tokenize: tokenizeLabel, partial: true }
const attributes: any = { tokenize: tokenizeAttributes, partial: true }

function tokenize (this: TokenizeContext, effects: Effects, ok: State, nok: State) {
  const self = this
  const initialPrefix = linePrefixSize(this.events)
  let sizeOpen = 0
  let previous: any
  const childContainersSequenceSize: number[] = []
  let containerFirstLine = true

  const section = useTokenState('componentContainerSection')

  /**
   * data tokenizer
   */
  return start

  function start (code: Code): State | void {
    /* istanbul ignore if - handled by mm */
    if (code !== Codes.colon) { throw new Error('expected `:`') }
    effects.enter('componentContainer')
    effects.enter('componentContainerFence')
    effects.enter('componentContainerSequence')
    return sequenceOpen(code)
  }

  function tokenizeSectionClosing (effects: Effects, ok: State, nok: State) {
    let size = 0
    let sectionIndentSize = 0
    let revertSectionState: () => void
    return closingPrefixAfter

    function closingPrefixAfter (code: Code): State | void {
      sectionIndentSize = linePrefixSize(self.events)

      // Close section
      revertSectionState = section.exit(effects)

      effects.enter('componentContainerSectionSequence')
      return closingSectionSequence(code)
    }

    function closingSectionSequence (code: Code): State | void {
      if (code === slotSeparatorCode) {
        effects.consume(code)
        size++
        return closingSectionSequence
      }

      if (size !== slotSeparatorLength) {
        // Revert section state to inital value before failing
        revertSectionState()
        return nok(code)
      }
      if (sectionIndentSize !== initialPrefix) {
        // Revert sect to inital value before failing
        revertSectionState()
        return nok(code)
      }

      // non ascii chars are invalid
      if (!asciiAlpha(code)) {
        // Revert sect to inital value before failing
        revertSectionState()
        return nok(code)
      }

      effects.exit('componentContainerSectionSequence')
      return factorySpace(effects, ok, 'whitespace')(code)
    }
  }

  function sectionOpen (code: number): void | State {
    // Open new Section
    section.enter(effects)

    if (markdownLineEnding(code)) {
      return factorySpace(effects, lineStart as State, 'whitespace')(code)
    }

    effects.enter('componentContainerSectionTitle')
    return sectionTitle(code) as State
  }

  function sectionTitle (code: Code): State | void {
    if (markdownLineEnding(code)) {
      effects.exit('componentContainerSectionTitle')
      return factorySpace(effects, lineStart as State, 'linePrefix', 4)(code)
    }
    effects.consume(code)
    return sectionTitle
  }

  function sequenceOpen (code: Code): State | void {
    if (code === Codes.colon) {
      effects.consume(code)
      sizeOpen++
      return sequenceOpen
    }

    if (sizeOpen < ContainerSequenceSize) {
      return nok(code)
    }

    effects.exit('componentContainerSequence')
    return createName.call(self, effects, afterName as State, nok, 'componentContainerName')(code)
  }

  function afterName (code: Code): State | void {
    return code === Codes.openingSquareBracket
      ? effects.attempt(label, afterLabel as State, afterLabel as State)(code)
      : afterLabel(code)
  }

  function afterLabel (code: Code): State | void {
    return code === Codes.openingCurlyBracket
      ? effects.attempt(attributes, afterAttributes as State, afterAttributes as State)(code)
      : afterAttributes(code)
  }

  function afterAttributes (code: Code): State | void {
    return factorySpace(effects, openAfter as State, 'whitespace')(code)
  }

  function openAfter (code: Code): State | void {
    effects.exit('componentContainerFence')

    if (code === null) {
      effects.exit('componentContainer')
      return ok(code)
    }

    if (markdownLineEnding(code)) {
      effects.enter('lineEnding')
      effects.consume(code)
      effects.exit('lineEnding')

      return self.interrupt ? ok : contentStart
    }

    return nok(code)
  }

  function contentStart (code: Code): State | void {
    if (code === null) {
      effects.exit('componentContainer')
      return ok(code)
    }
    if (containerFirstLine && (code === Codes.dash || markdownSpace(code))) {
      containerFirstLine = false
      return tokenizeFrontMatter(effects, ok, nok, contentStart, initialPrefix)(code)
    }

    effects.enter('componentContainerContent')
    return lineStart(code)
  }

  function lineStartAfterPrefix (code: Code): State | void {
    if (code === null) {
      return after(code)
    }

    // detect slots
    if (!childContainersSequenceSize.length && (code === slotSeparatorCode || code === Codes.space)) {
      return effects.attempt(
        { tokenize: tokenizeSectionClosing, partial: true } as any,
        sectionOpen as State,
        chunkStart as State
      )(code)
    }

    /**
     * disbale spliting inner sections
     */
    if (code === Codes.colon) {
      return effects.attempt(
        { tokenize: tokenizeClosingFence, partial: true } as any,
        after as State,
        chunkStart as State
      )(code)
    }

    return chunkStart(code)
  }

  function lineStart (code: Code): State | void {
    if (code === null) {
      return after(code)
    }

    return initialPrefix
      ? factorySpace(effects, lineStartAfterPrefix as State, 'linePrefix', initialPrefix + 1)(code)
      : lineStartAfterPrefix(code)
  }

  function chunkStart (code: Code): State | void {
    if (code === null) {
      return after(code)
    }

    // Open new Section
    section.enterOnce(effects)

    // @ts-ignore
    const token = effects.enter('chunkDocument', {
      contentType: 'document',
      previous
    })
    if (previous) { previous.next = token }
    previous = token
    return contentContinue(code)
  }

  function contentContinue (code: Code): State | void {
    if (code === null) {
      effects.exit('chunkDocument')
      return after(code)
    }

    if (markdownLineEnding(code)) {
      effects.consume(code)
      effects.exit('chunkDocument')
      return lineStart
    }

    effects.consume(code)
    return contentContinue
  }

  function after (code: Code): State | void {
    // Close section
    section.exit(effects)
    effects.exit('componentContainerContent')
    effects.exit('componentContainer')
    return ok(code)
  }

  function tokenizeClosingFence (effects: Effects, ok: State, nok: State) {
    let size = 0

    return factorySpace(effects, closingPrefixAfter as State, 'linePrefix', 4)

    function closingPrefixAfter (code: Code): State | void {
      effects.enter('componentContainerFence')
      effects.enter('componentContainerSequence')
      return closingSequence(code)
    }

    function closingSequence (code: Code): State | void {
      if (code === Codes.colon) {
        effects.consume(code)
        size++
        return closingSequence
      }

      if (childContainersSequenceSize.length) {
        if (size === childContainersSequenceSize[childContainersSequenceSize.length - 1]) {
          childContainersSequenceSize.pop()
        }
        return nok(code)
      }

      // it is important to match sequence
      if (size !== sizeOpen) { return nok(code) }
      effects.exit('componentContainerSequence')
      return factorySpace(effects, closingSequenceEnd as State, 'whitespace')(code)
    }

    function closingSequenceEnd (code: Code): State | void {
      if (code === null || markdownLineEnding(code)) {
        effects.exit('componentContainerFence')
        return ok(code)
      }
      childContainersSequenceSize.push(size)
      return nok(code)
    }
  }
}

function tokenizeLabel (effects: Effects, ok: State, nok: State) {
  // Always a `[`
  return createLabel(
    effects,
    ok,
    nok,
    'componentContainerLabel',
    'componentContainerLabelMarker',
    'componentContainerLabelString',
    true
  )
}

function tokenizeAttributes (effects: Effects, ok: State, nok: State) {
  // Always a `{`
  return createAttributes(
    effects,
    ok,
    nok,
    'componentContainerAttributes',
    'componentContainerAttributesMarker',
    'componentContainerAttribute',
    'componentContainerAttributeId',
    'componentContainerAttributeClass',
    'componentContainerAttributeName',
    'componentContainerAttributeInitializerMarker',
    'componentContainerAttributeValueLiteral',
    'componentContainerAttributeValue',
    'componentContainerAttributeValueMarker',
    'componentContainerAttributeValueData',
    true
  )
}

export default {
  tokenize,
  concrete: true
}
