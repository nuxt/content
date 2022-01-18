<template>
  <div>
    <div>
      <div>
        <form @submit.prevent="query">
          <input v-model="title" type="text" />
          <button>Query</button>
        </form>
      </div>
      <span v-for="item in list" :key="item" @click="content = item.id">
        {{ item.title }}
      </span>
    </div>
    <Content v-if="content" :id="content" />
  </div>
</template>

<script setup>
const content = ref('')
const list = ref('')
const title = ref('')

const query = async () => {
  list.value = await queryContent()
    .where({ title: { $icontains: title.value } })
    .version(1)
    .fetch()
}
await query()
</script>

<style>
span {
  display: inline-block;
  padding: 5px;
  margin: 5px;
  border: 1px solid #ccc;
  cursor: pointer;
}
</style>
