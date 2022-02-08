import type { Effects, State, TokenizeContext } from 'micromark-util-types'
import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding, asciiAlpha, markdownSpace } from 'micromark-util-character'
import { sizeChunks } from './utils'
import { Codes, ContainerSequenceSize, SectionSequenceSize } from './constants'
import createName from './factory-name'
import createLabel from './factory-label'
import createAttributes from './factory-attributes'
const label: any = { tokenize: tokenizeLabel, partial: true }
const attributes: any = { tokenize: tokenizeAttributes, partial: true }

// section sparator
const sectionSeparatorCode = Codes.hash
const sectionSeparatorLength = 1

/**
 * Calculate line indention size, line indention could be consists of multiple `linePrefix` events
 * @param events parser tokens
 * @returns line indention size
 */
function linePrefixSize(events: any[]) {
  let size = 0
  let index = events.length - 1
  let tail = events[index]
  while (index >= 0 && tail && tail[1].type === 'linePrefix' && tail[0] === 'exit') {
    size += sizeChunks(tail[2].sliceStream(tail[1]))
    index -= 1
    tail = events[index]
  }

  return size
}

enum MarkDownDataSectionState {
  NotSeen = 0,
  Open = 1,
  Closed = 2
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State) {
  const self = this
  const initialPrefix = linePrefixSize(this.events)
  let sizeOpen = 0
  let previous: any
  const containerSequenceSize: number[] = []

  /**
   * data tokenizer
   */
  const data: any = tokenizeData.call(this, effects, lineStart as State)

  return start

  function start(code: number) {
    /* istanbul ignore if - handled by mm */
    if (code !== Codes.colon) throw new Error('expected `:`')
    effects.enter('componentContainer')
    effects.enter('componentContainerFence')
    effects.enter('componentContainerSequence')
    return sequenceOpen(code)
  }

  function tokenizeSectionClosing(effects: Effects, ok: State, nok: State) {
    let size = 0
    let sectionIndentSize = 0

    return closingPrefixAfter

    function closingPrefixAfter(code: number) {
      sectionIndentSize = linePrefixSize(self.events)
      effects.exit('componentContainerSection')
      effects.enter('componentContainerSectionSequence')
      return closingSectionSequence(code)
    }

    function closingSectionSequence(code: number) {
      if (code === sectionSeparatorCode) {
        effects.consume(code)
        size++
        return closingSectionSequence
      }

      if (size !== sectionSeparatorLength) return nok(code)
      if (sectionIndentSize !== initialPrefix) return nok(code)

      // non ascii chars are invalid
      if (!asciiAlpha(code)) return nok(code)

      effects.exit('componentContainerSectionSequence')
      return factorySpace(effects, ok, 'whitespace')(code)
    }
  }

  function sectionOpen(code: number): void | State {
    effects.enter('componentContainerSection')

    if (markdownLineEnding(code)) {
      return factorySpace(effects, lineStart as State, 'whitespace')(code)
    }

    effects.enter('componentContainerSectionTitle')
    return sectionTitle as State
  }

  function sectionTitle(code: number) {
    if (markdownLineEnding(code)) {
      effects.exit('componentContainerSectionTitle')
      return factorySpace(effects, lineStart as State, 'linePrefix', 4)(code)
    }
    effects.consume(code)
    return sectionTitle
  }

  function sequenceOpen(code: number) {
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

  function afterName(code: number) {
    return code === Codes.openingSquareBracket
      ? effects.attempt(label, afterLabel as State, afterLabel as State)(code)
      : afterLabel(code)
  }

  function afterLabel(code: number) {
    return code === Codes.openingCurlyBracket
      ? effects.attempt(attributes, afterAttributes as State, afterAttributes as State)(code)
      : afterAttributes(code)
  }

  function afterAttributes(code: number) {
    return factorySpace(effects, openAfter as State, 'whitespace')(code)
  }

  function openAfter(code: number) {
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

  function contentStart(code: number) {
    if (code === null) {
      effects.exit('componentContainer')
      return ok(code)
    }

    effects.enter('componentContainerContent')

    if (!containerSequenceSize.length && !data.isClosed() && (code === Codes.dash || markdownSpace(code))) {
      function _chunkStart(code: number) {
        data.close()
        effects.enter('componentContainerSection')

        return lineStart(code)
      }
      return effects.attempt(data.tokenize, data.sectionOpen as State, _chunkStart as State)
    } else {
      data.close()
    }

    effects.enter('componentContainerSection')
    return lineStart(code)
  }

  function lineStartAfterPrefix(code: number) {
    if (code === null) {
      return after(code)
    }

    // detect slots
    if (!containerSequenceSize.length && (code === sectionSeparatorCode || code === Codes.space)) {
      return effects.attempt(
        { tokenize: tokenizeSectionClosing, partial: true } as any,
        sectionOpen as State,
        chunkStart as State
      )
    }
    // detect slots
    if (!containerSequenceSize.length && !data.isClosed() && (code === Codes.dash || code === Codes.space)) {
      return effects.attempt(data.tokenize, data.sectionOpen as State, chunkStart as State)
    }

    const attempt = effects.attempt(
      { tokenize: tokenizeClosingFence, partial: true } as any,
      after as State,
      chunkStart as State
    )

    /**
     * disbale spliting inner sections
     */
    if (code === Codes.colon) {
      return effects.check({ tokenize: detectContainer, partial: true } as any, chunkStart as State, attempt)(code)
    }

    return attempt
  }

  function lineStart(code: number) {
    if (code === null) {
      return after(code)
    }

    return initialPrefix
      ? factorySpace(effects, lineStartAfterPrefix as State, 'linePrefix', initialPrefix + 1)
      : lineStartAfterPrefix
  }

  function chunkStart(code: number) {
    if (code === null) {
      return after(code)
    }

    // @ts-ignore
    const token = effects.enter('chunkDocument', {
      contentType: 'document',
      previous
    })
    if (previous) previous.next = token
    previous = token
    return contentContinue(code)
  }

  function contentContinue(code: number) {
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

  function after(code: number) {
    effects.exit('componentContainerSection')
    effects.exit('componentContainerContent')
    effects.exit('componentContainer')
    return ok(code)
  }

  function tokenizeClosingFence(effects: Effects, ok: State, nok: State) {
    let size = 0

    return factorySpace(effects, closingPrefixAfter as State, 'linePrefix', 4)

    function closingPrefixAfter(code: number) {
      effects.enter('componentContainerFence')
      effects.enter('componentContainerSequence')
      return closingSequence(code)
    }

    function closingSequence(code: number) {
      if (code === Codes.colon) {
        effects.consume(code)
        size++
        return closingSequence
      }

      if (containerSequenceSize.length) {
        if (size === containerSequenceSize[containerSequenceSize.length - 1]) {
          containerSequenceSize.pop()
        }
        return nok(code)
      }

      // it is important to match sequence
      if (size !== sizeOpen) return nok(code)
      effects.exit('componentContainerSequence')
      return factorySpace(effects, closingSequenceEnd as State, 'whitespace')(code)
    }

    function closingSequenceEnd(code: number) {
      if (code === null || markdownLineEnding(code)) {
        effects.exit('componentContainerFence')
        return ok(code)
      }

      return nok(code)
    }
  }
  function detectContainer(effects: Effects, ok: State, nok: State) {
    let size = 0

    return openingSequence

    function openingSequence(code: number) {
      if (code === Codes.colon) {
        effects.consume(code)
        size++
        return openingSequence
      }

      if (size < ContainerSequenceSize) return nok(code)

      return openingSequenceEnd
    }

    function openingSequenceEnd(code: number) {
      if (code === null || markdownLineEnding(code)) {
        return nok(code)
      }

      // memorize cotainer sequence
      containerSequenceSize.push(size)

      return ok(code)
    }
  }
}

function tokenizeData(this: TokenizeContext, effects: Effects, ok: State) {
  const initialPrefix = linePrefixSize(this.events)
  let sectionState: MarkDownDataSectionState = MarkDownDataSectionState.NotSeen
  const data = {
    state: () => sectionState,
    close: () => {
      sectionState = MarkDownDataSectionState.Closed
    },
    isClosed: () => sectionState === MarkDownDataSectionState.Closed,
    tokenize: { tokenize: tokenizeDataSection, partial: true } as any,
    sectionOpen
  }
  return data
  function tokenizeDataSection(this: TokenizeContext, effects: Effects, ok: State, nok: State) {
    const self = this
    let size = 0
    let sectionIndentSize = 0

    return closingPrefixAfter

    function closingPrefixAfter(code: number) {
      if (data.isClosed()) {
        return nok(code)
      }
      if (markdownSpace(code)) {
        effects.consume(code)
        sectionIndentSize += 1
        return closingPrefixAfter
      }
      if (sectionIndentSize === 0) {
        sectionIndentSize = linePrefixSize(self.events)
      }
      if (sectionState === MarkDownDataSectionState.Open) {
        effects.exit('componentContainerDataSection')
      }

      effects.enter('componentContainerSectionSequence')
      return closingSectionSequence(code)
    }

    function closingSectionSequence(code: number) {
      if (code === Codes.dash || markdownSpace(code)) {
        effects.consume(code)
        size++
        return closingSectionSequence
      }

      if (size < SectionSequenceSize) return nok(code)

      if (sectionIndentSize !== initialPrefix) return nok(code)
      if (!markdownLineEnding(code)) return nok(code)

      effects.exit('componentContainerSectionSequence')
      return factorySpace(effects, ok, 'whitespace')(code)
    }
  }

  function sectionOpen(code: number) {
    if (sectionState === MarkDownDataSectionState.NotSeen) {
      effects.enter('componentContainerDataSection')
      sectionState = MarkDownDataSectionState.Open
    } else {
      sectionState = MarkDownDataSectionState.Closed
      effects.enter('componentContainerSection')
    }

    return factorySpace(effects, ok, 'whitespace')(code)
  }
}

function tokenizeLabel(effects: Effects, ok: State, nok: State) {
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

function tokenizeAttributes(effects: Effects, ok: State, nok: State) {
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
