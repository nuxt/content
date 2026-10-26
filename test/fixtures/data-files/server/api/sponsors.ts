export default defineEventHandler(event => queryCollection(event, 'sponsors').all())
