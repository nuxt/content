export type MinimalText = string
export type MinimalElement = [string, Record<string, unknown>, ...MinimalNode[]]
export type MinimalNode = MinimalElement | MinimalText
export type MinimalTree = {
  type: 'minimal'
  value: MinimalNode[]
}
