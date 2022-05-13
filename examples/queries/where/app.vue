<script setup>
const { data: directorQuery } = await useAsyncData('director', () => {
  return queryContent('/').where({ director: 'Hayao Miyazaki' }).find()
})

const { data: yearQuery } = await useAsyncData('year', () => {
  return queryContent('/').where({ release_date: { $lte: 1997 } }).find()
})

console.log(directorQuery.value)
</script>

<template>
  <NuxtExampleLayout example="queries/where" repo="nuxt/content">
    <template #icon>
      Nuxt/content
    </template>
    <header class="text-left">
      <p>The dataset in the <code class="inline">content/index.json</code> lists movies from Studio Ghibli. It is based on the <a href="https://ghibliapi.herokuapp.com/">Ghibli API</a></p>
      <hr class="m-2">
    </header>
    <main>
      <section>
        <h2>Director query</h2>
        <code>
          queryContent('/').where({ 'body.director': 'Hayao Miyazaki' }).find()
        </code>
        <ul v-if="directorQuery">
          <li v-for="movie in directorQuery" :key="movie.id">
            {{ movie.title }}
          </li>
        </ul>
      </section>

      <section>
        <h2>Year query</h2>
        <code>
          queryContent('/').where({ release_date: { $lte: 1997 } }).find()
        </code>
        <ul v-if="yearQuery">
          <li v-for="movie in yearQuery" :key="movie.id">
            {{ movie.title }} - {{ movie.release_date }}
          </li>
        </ul>
      </section>
    </main>
  </NuxtExampleLayout>
</template>
