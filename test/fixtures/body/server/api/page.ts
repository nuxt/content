export default defineEventHandler(event => queryCollection(event, 'docs').path('/').first())
