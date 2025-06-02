import type { MDCRoot } from '@nuxtjs/mdc'
import type { MinimalTree, MinimalNode } from '@nuxt/content'
import { toHast, fromHast } from 'minimark/hast'
import type { MinimarkNode, MinimarkTree } from 'minimark'
import { visit as minimarkVisit } from 'minimark'

type Tree = MinimalTree | MinimarkTree
type Node = MinimalNode | MinimarkNode

export function compressTree(input: MDCRoot): MinimarkTree {
  return fromHast(input)
}

export function decompressTree(input: Tree): MDCRoot {
  return toHast({ type: 'minimark', value: input.value }) as MDCRoot
}

export function visit(tree: Tree, checker: (node: Node) => boolean, visitor: (node: Node) => Node | undefined) {
  minimarkVisit({ type: 'minimark', value: tree.value }, checker, visitor)
}
