<template>
  <div>
    <pre>$${{ data }}$$</pre>
  </div>
</template>

<script setup lang="ts">
import { queryContent, useRoute, useAsyncData } from '#imports'

const route = useRoute()
const prefix = route.query.prefix === undefined ? '/_partial' : ''
const path = route.query.path || ''
const findOne = route.query.findOne || false
const where = route.query.where ? JSON.parse(route.query.where) : false

const { data } = await useAsyncData('foo', () => {
  let q = queryContent(prefix + path || undefined)

  if (where) {
    q = q.where(where)
  }

  return findOne ? q.findOne() : q.find()
},
{
  transform: data => findOne ? data.result?._id : data.result?.map(d => d._id)
})
</script>
