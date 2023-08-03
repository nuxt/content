import type { Effects, State, Code, TokenizeContext } from 'micromark-util-types'
import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { createTokenizer } from './create-tokenizer'

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    row: 'row'
    column: 'column'
    columnSeparator: 'columnSeparator'
    newline: 'newline'
    quotedData: 'quotedData'
    quotedDataChunk: 'quotedDataChunk'
    quoteFence: 'quoteFence'
    emptyLine: 'emptyLine'
  }
}

function initializeDocument (this: TokenizeContext, effects: Effects) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this
  const delimiter = ((this.parser as any).delimiter || ',').charCodeAt(0)

  return enterRow

  function enterRow (code: Code): State {
    return effects.attempt(
      { tokenize: attemptLastLine },
      (code) => {
        effects.consume(code)
        return enterRow
      },
      (code) => {
        effects.enter('row')
        return enterColumn(code)
      }
    )(code)!
  }

  function enterColumn (code: Code): State {
    effects.enter('column')
    return content(code)
  }

  function content (code: Code): State {
    if (code === null) {
      effects.exit('column')
      effects.exit('row')
      effects.consume(code)
      return content
    }
    if (code === 34 /** " */) {
      return quotedData(code)
    }
    if (code === delimiter) {
      // Hanlde:
      // - "1,,3,4"
      // - ",2,3,4"
      if (self.previous === delimiter || markdownLineEnding(self.previous) || self.previous === null) {
        effects.enter('data')
        effects.exit('data')
      }
      effects.exit('column')
      effects.enter('columnSeparator')
      effects.consume(code)
      effects.exit('columnSeparator')
      effects.enter('column')
      return content
    }
    if (markdownLineEnding(code)) {
      effects.exit('column')
      effects.enter('newline')
      effects.consume(code)
      effects.exit('newline')
      effects.exit('row')

      return enterRow
    }
    return data(code)
  }

  // data
  function data (code: Code): State {
    effects.enter('data')
    return dataChunk(code)
  }

  function dataChunk (code: Code): State {
    if (code === null || markdownLineEnding(code) || code === delimiter) {
      effects.exit('data')
      return content(code)
    }
    if (code === 92 /** \ */) {
      return escapeCharacter(code)
    }
    effects.consume(code)
    return dataChunk
  }

  function escapeCharacter (code: Code): State {
    effects.consume(code)
    return function (code: Code): State {
      effects.consume(code)
      return content
    }
  }

  function quotedData (code: Code): State {
    effects.enter('quotedData')
    effects.enter('quotedDataChunk')
    effects.consume(code)

    return quotedDataChunk
  }

  function quotedDataChunk (code: Code): State {
    if (code === 92 /** \ */) {
      return escapeCharacter(code)
    }
    if (code === 34) {
      return effects.attempt(
        { tokenize: attemptDoubleQuote },
        (code: Code): State => {
          effects.exit('quotedDataChunk')
          effects.enter('quotedDataChunk')
          return quotedDataChunk(code)
        },
        (code: Code): State => {
          effects.consume(code)
          effects.exit('quotedDataChunk')
          effects.exit('quotedData')

          return content
        }
      )(code)!
    }
    effects.consume(code)
    return quotedDataChunk
  }
}

function attemptDoubleQuote (effects: Effects, ok: State, nok: State) {
  return startSequence

  function startSequence (code: Code): State {
    if (code !== 34) {
      return nok(code)!
    }
    effects.enter('quoteFence')
    effects.consume(code)
    return sequence
  }

  function sequence (code: Code): State {
    if (code !== 34) {
      return nok(code)!
    }
    effects.consume(code)
    effects.exit('quoteFence')
    return (code: Code): State => ok(code)!
  }
}

function attemptLastLine (effects: Effects, ok: State, nok: State) {
  return enterLine as State

  function enterLine (code: Code): State {
    if (!markdownSpace(code) && code !== null) {
      return nok(code)!
    }
    effects.enter('emptyLine')
    return continueLine(code)
  }

  function continueLine (code: Code): State {
    if (markdownSpace(code)) {
      effects.consume(code)
      return continueLine
    }
    if (code === null) {
      effects.exit('emptyLine')
      return ok(code)!
    }
    return nok(code)!
  }
}

export const parse = (options: any) => {
  return createTokenizer(
    { ...options },
    { tokenize: initializeDocument },
    undefined
  )
}
