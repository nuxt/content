import { ContentTransformer } from '../../../../src/runtime/types'

export default <ContentTransformer> {
  name: 'custom-transformer',
  // note this is using the deprecated `extentions` as a test
  extentions: ['.*'],
  transform (content) {
    content._customTransformed = true
    return content
  }
}
