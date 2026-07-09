import { eventHandler, toWebRequest } from 'h3'
import { cms } from '#imports'

export default eventHandler(event => cms.handler(toWebRequest(event)))
