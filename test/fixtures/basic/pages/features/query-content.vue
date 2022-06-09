<template>
  <div>
    <pre>$${{ data }}$$</pre>
  </div>
</template>

<script setup>
const route = useRoute()
const path = route.query.path
const findOne = route.query.findOne

const { data } = await useAsyncData('foo', () => {
  const q = queryContent('/_partial/prefix' + path)
  return findOne ? q.findOne() : q.find()
}, {
  transform: (data) => {
    return findOne ? data._id : data.map(d => d._id)
  }
})
</script>
