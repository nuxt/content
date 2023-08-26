// @ts-nocheck
// TODO: fix types
// Based on mdast-util-from-markdown
// See: https://github.com/syntax-tree/mdast-util-from-markdown/blob/03581b3ede92d3874a6689a96b8ae0a7c17b86af/dev/lib/index.js
import { toString } from 'mdast-util-to-string'
import { preprocess, postprocess } from 'micromark'
import { stringifyPosition } from 'unist-util-stringify-position'
import { Token, Event, Point as MPoint } from 'micromark-util-types'
import { parse } from './parser'

type Point = Omit<MPoint, '_index' | '_bufferIndex'>
type Node = {
  type: string
  children: Array<Node>
  position?: {
    start?: Point
    end?: Point
  }
  value?: string
}

const own = {}.hasOwnProperty

const initialPoint: Point = {
  line: 1,
  column: 1,
  offset: 0
}

export const fromCSV = function (value, encoding?, options?) {
  if (typeof encoding !== 'string') {
    options = encoding
    encoding = undefined
  }

  return compiler()(
    postprocess(
      parse(options).write(preprocess()(value, encoding, true))
    )
  )
}

function compiler () {
  const config = {
    enter: {
      column: opener(openColumn),
      row: opener(openRow),
      data: onenterdata,
      quotedData: onenterdata
    },
    exit: {
      row: closer(),
      column: closer(),
      data: onexitdata,
      quotedData: onexitQuotedData
    }
  }

  return compile

  function compile (events: Array<Event>) {
    const tree: Node = {
      type: 'root',
      children: []
    }

    const stack = [tree]

    const tokenStack = []

    const context = {
      stack,
      tokenStack,
      config,
      enter,
      exit,
      resume
    }

    let index = -1

    while (++index < events.length) {
      const handler = config[events[index][0]]

      if (own.call(handler, events[index][1].type)) {
        handler[events[index][1].type].call(
          Object.assign(
            {
              sliceSerialize: events[index][2].sliceSerialize
            },
            context
          ),
          events[index][1]
        )
      }
    }

    if (tokenStack.length > 0) {
      const tail: Function = tokenStack[tokenStack.length - 1]
      const handler = tail[1] || defaultOnError
      handler.call(context, undefined, tail[0])
    } // Figure out `root` position.

    tree.position = {
      start: point(
        events.length > 0 ? events[0][1].start : initialPoint
      ),
      end: point(
        events.length > 0 ? events[events.length - 2][1].end : initialPoint
      )
    }

    return tree
  }

  function point (d: Point): Point {
    return {
      line: d.line,
      column: d.column,
      offset: d.offset
    }
  }

  function opener (create, and?) {
    return open

    function open (token: Token) {
      enter.call(this, create(token), token)
      if (and) { and.call(this, token) }
    }
  }

  function enter (node: Node, token: Token, errorHandler) {
    const parent = this.stack[this.stack.length - 1]
    parent.children.push(node)
    this.stack.push(node)
    this.tokenStack.push([token, errorHandler])

    node.position = {
      start: point(token.start)
    }
    return node
  }

  function closer (and?) {
    return close

    function close (token: Token) {
      if (and) { and.call(this, token) }
      exit.call(this, token)
    }
  }

  function exit (token: Token, onExitError) {
    const node = this.stack.pop()
    const open = this.tokenStack.pop()

    if (!open) {
      throw new Error(
        'Cannot close `' +
           token.type +
           '` (' +
           stringifyPosition({
             start: token.start,
             end: token.end
           }) +
           '): it’s not open'
      )
    } else if (open[0].type !== token.type) {
      if (onExitError) {
        onExitError.call(this, token, open[0])
      } else {
        const handler = open[1] || defaultOnError
        handler.call(this, token, open[0])
      }
    }
    node.position.end = point(token.end)
    return node
  }

  function resume () {
    return toString(this.stack.pop())
  }

  function onenterdata (token: Token) {
    const parent = this.stack[this.stack.length - 1]

    let tail = parent.children[parent.children.length - 1]

    if (!tail || tail.type !== 'text') {
      // Add a new text node.
      tail = text()

      tail.position = {
        start: point(token.start)
      }

      parent.children.push(tail)
    }
    this.stack.push(tail)
  }

  function onexitdata (token: Token) {
    const tail = this.stack.pop()
    tail.value += this.sliceSerialize(token).trim().replace(/""/g, '"')
    tail.position.end = point(token.end)
  }
  function onexitQuotedData (token: Token) {
    const tail = this.stack.pop()
    const value = this.sliceSerialize(token)
    tail.value += this.sliceSerialize(token).trim().substring(1, value.length - 1).replace(/""/g, '"')
    tail.position.end = point(token.end)
  }

  function text () {
    return {
      type: 'text',
      value: ''
    }
  }

  function openColumn () {
    return {
      type: 'column',
      children: []
    }
  }
  function openRow () {
    return {
      type: 'row',
      children: []
    }
  }
}

function defaultOnError (left, right) {
  if (left) {
    throw new Error(
      'Cannot close `' +
         left.type +
         '` (' +
         stringifyPosition({
           start: left.start,
           end: left.end
         }) +
         '): a different token (`' +
         right.type +
         '`, ' +
         stringifyPosition({
           start: right.start,
           end: right.end
         }) +
         ') is open'
    )
  } else {
    throw new Error(
      'Cannot close document, a token (`' +
         right.type +
         '`, ' +
         stringifyPosition({
           start: right.start,
           end: right.end
         }) +
         ') is still open'
    )
  }
}
