import { stringifyEntitiesLight } from 'stringify-entities'
import { containerFlow } from 'mdast-util-to-markdown/lib/util/container-flow.js'
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing.js'
import { checkQuote } from 'mdast-util-to-markdown/lib/util/check-quote.js'
import type { Parent } from 'mdast-util-to-markdown/lib/types'
import { stringify } from './frontmatter'

const own = {}.hasOwnProperty

const shortcut = /^[^\t\n\r "#'.<=>`}]+$/
const baseFense = 2

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
  containerComponent,
  textComponent,
  componentContainerSection
}

type NodeComponentContainerSection = Parent & { name: string }
function componentContainerSection (node: NodeComponentContainerSection, _: any, context: any) {
  context.indexStack = context.stack
  return `#${(node as any).name}\n\n${content(node, context)}`
}

type NodeTextComponent = Parent & { name: string; rawData: string }
function textComponent (node: NodeTextComponent, _: any, context: any) {
  context.indexStack = context.stack
  const exit = context.enter(node.type)
  let value = ':' + (node.name || '') + label(node, context) + attributes(node, context)
  value += '\n' + content(node, context)
  exit()
  return value
}

type NodeContainerComponent = Parent & { name: string; fmAttributes?: Record<string, any> }
let nest = 0
function containerComponent (node: NodeContainerComponent, _: any, context: any) {
  context.indexStack = context.stack
  const prefix = ':'.repeat(baseFense + nest)
  nest += 1
  const exit = context.enter(node.type)
  let value = prefix + (node.name || '') + label(node, context) + attributes(node, context)
  let subvalue

  // Convert attributes to YAML FrontMatter format
  if (node.fmAttributes) {
    value += '\n' + stringify(node.fmAttributes).trim()
  }

  if ((node.type as string) === 'containerComponent') {
    subvalue = content(node, context)
    if (subvalue) { value += '\n' + subvalue }
    value += '\n' + prefix

    if (nest > 1) {
      value = value
        .split('\n')
        .map(line => '  ' + line)
        .join('\n')
    }
  }
  nest -= 1
  exit()
  return value
}

containerComponent.peek = function peekComponent () {
  return ':'
}

function label (node: Parent, context: any) {
  let label: any = node

  if ((node.type as string) === 'containerComponent') {
    if (!inlineComponentLabel(node)) { return '' }
    label = node.children[0]
  }

  const exit = context.enter('label')
  const subexit = context.enter(node.type + 'Label')
  const value = containerPhrasing(label, context, { before: '[', after: ']' })
  subexit()
  exit()
  return value ? '[' + value + ']' : ''
}

function attributes (node: Parent, context: any) {
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
      } else if (key.startsWith(':') && value === 'true') {
        values.push(key.slice(1))
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

  function quoted (key: string, value: string) {
    return key + '=' + quote + stringifyEntitiesLight(value, { subset }) + quote
  }
}

function content (node: Parent, context: any) {
  const content = inlineComponentLabel(node) ? Object.assign({}, node, { children: node.children.slice(1) }) : node
  return containerFlow(content, context)
}

function inlineComponentLabel (node: Parent) {
  return node.children && node.children[0] && node.children[0].data && node.children[0].data.componentLabel
}

export default {
  handlers,
  unsafe
}
