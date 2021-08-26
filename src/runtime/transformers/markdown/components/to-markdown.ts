import { stringifyEntitiesLight } from 'stringify-entities'
import { visitParents } from 'unist-util-visit-parents'
import { containerFlow } from 'mdast-util-to-markdown/lib/util/container-flow'
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing'
import { checkQuote } from 'mdast-util-to-markdown/lib/util/check-quote'
import type { Parent } from 'mdast-util-to-markdown/lib/types'

const own = {}.hasOwnProperty

const shortcut = /^[^\t\n\r "#'.<=>`}]+$/

// TODO: convert container sections to markdown
const unsafe = [
  {
    character: '\r',
    inConstruct: ['leafComponentLabel', 'containerComponentLabel']
  },
  {
    character: '\n',
    inConstruct: ['leafComponentLabel', 'containerComponentLabel']
  },
  {
    before: '[^:]',
    character: ':',
    after: '[A-Za-z]',
    inConstruct: ['phrasing']
  },
  { atBreak: true, character: ':', after: ':' }
]

const handlers = {
  containerComponent: handleComponent,
  leafComponent: handleComponent,
  textComponent: handleComponent
}

handleComponent.peek = peekComponent

function handleComponent(node: Parent, _: any, context: any) {
  const prefix = fence(node)
  const exit = context.enter(node.type)
  let value = prefix + ((node as any).name || '') + label(node, context) + attributes(node, context)
  let subvalue

  if ((node.type as string) === 'containerComponent') {
    subvalue = content(node, context)
    if (subvalue) value += '\n' + subvalue
    value += '\n' + prefix
  }

  exit()
  return value
}

function peekComponent() {
  return ':'
}

function label(node: Parent, context: any) {
  let label: any = node

  if ((node.type as string) === 'containerComponent') {
    if (!inlineComponentLabel(node)) return ''
    label = node.children[0]
  }

  const exit = context.enter('label')
  const subexit = context.enter(node.type + 'Label')
  const value = containerPhrasing(label, context, { before: '[', after: ']' })
  subexit()
  exit()
  return value ? '[' + value + ']' : ''
}

function attributes(node: Parent, context: any) {
  const quote = checkQuote(context)
  const subset = (node.type as string) === 'textComponent' ? [quote] : [quote, '\n', '\r']
  const attrs = (node as any).attributes || {}
  const values = []
  let id
  let classesFull: string | string[] = ''
  let classes: string | string[] = ''
  let value
  let key
  let index

  for (key in attrs) {
    if (own.call(attrs, key) && attrs[key] != null) {
      value = String(attrs[key])

      if (key === 'id') {
        id = shortcut.test(value) ? '#' + value : quoted('id', value)
      } else if (key === 'class') {
        value = value.split(/[\t\n\r ]+/g)
        classesFull = []
        classes = []
        index = -1

        while (++index < value.length) {
          ;(shortcut.test(value[index]) ? classes : classesFull).push(value[index])
        }

        classesFull = classesFull.length ? quoted('class', classesFull.join(' ')) : ''
        classes = classes.length ? '.' + classes.join('.') : ''
      } else {
        values.push(quoted(key, value))
      }
    }
  }

  if (classesFull) {
    values.unshift(classesFull)
  }

  if (classes) {
    values.unshift(classes)
  }

  if (id) {
    values.unshift(id)
  }

  return values.length ? '{' + values.join(' ') + '}' : ''

  function quoted(key: string, value: any) {
    return key + (value ? '=' + quote + stringifyEntitiesLight(value, { subset }) + quote : '')
  }
}

function content(node: Parent, context: any) {
  const content = inlineComponentLabel(node) ? Object.assign({}, node, { children: node.children.slice(1) }) : node

  return containerFlow(content, context)
}

function inlineComponentLabel(node: Parent) {
  return node.children && node.children[0] && node.children[0].data && node.children[0].data.componentLabel
}

function fence(node: Parent) {
  let size = 0

  if ((node.type as string) === 'containerComponent') {
    visitParents(node, 'containerComponent', onvisit)
    size += 3
  } else if ((node.type as string) === 'leafComponent') {
    size = 2
  } else {
    size = 1
  }

  return ':'.repeat(size)

  function onvisit(_node: any, parents: any[]) {
    let index = parents.length
    let nesting = 0

    while (index--) {
      if (parents[index].type === 'containerComponent') {
        nesting++
      }
    }

    if (nesting > size) size = nesting
  }
}

export default {
  handlers,
  unsafe
}
