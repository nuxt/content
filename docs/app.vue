<template><div id="main" ref="test">Hello World!</div></template>

<script setup>
const test = ref()

console.log('Hello World!')

console.log({ test })
</script>
