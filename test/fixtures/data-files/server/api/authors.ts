export default defineEventHandler(event => queryCollection(event, 'authors').all())
