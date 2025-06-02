import type { MinimarkNode, MinimarkElement, MinimarkText } from 'minimark'

export type { MinimarkNode, MinimarkElement, MinimarkText, MinimarkTree } from 'minimark'

/**
 * @deprecated Use `MinimarkText` instead
 */
export type MinimalText = MinimarkText

/**
 * @deprecated Use `MinimarkElement` instead
 */
export type MinimalElement = MinimarkElement

/**
 * @deprecated Use `MinimarkNode` instead
 */
export type MinimalNode = MinimarkNode

/**
 * @deprecated Use `MinimarkTree` instead
 */
export type MinimalTree = {
  type: 'minimal'
  value: MinimalNode[]
}
