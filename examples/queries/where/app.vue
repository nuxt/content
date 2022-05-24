<script setup>
const { data: equalQuery } = await useAsyncData('equal', () => {
  return queryContent('/').where({ director: 'Hayao Miyazaki' }).find()
})

const { data: lowerThanQuery } = await useAsyncData('lower-than', () => {
  return queryContent('/').where({ release_date: { $lt: 1997 } }).find()
})

const { data: notEqualQuery } = await useAsyncData('not-equal', () => {
  return queryContent('/').where({ director: { $ne: 'Hayao Miyazaki' } }).find()
})

const { data: inQuery } = await useAsyncData('in', () => {
  return queryContent('/').where({ director: { $in: ['Hayao Miyazaki', 'Yoshifumi Kondō'] } }).find()
})

</script>

<template>
  <NuxtExampleLayout example="queries/where" repo="nuxt/content">
    <header class="text-left">
      <p>The dataset in the <code class="inline">content/index.json</code> lists movies from Studio Ghibli. It is based on the <a href="https://ghibliapi.herokuapp.com/">Ghibli API</a></p>
      <hr class="m-2">
    </header>
    <main>
      <section>
        <header>
          <h2>Equal query</h2>
          <code>
            queryContent('/').where({ director: 'Hayao Miyazaki' }).find()
          </code>
        </header>
        <ul v-if="equalQuery">
          <li v-for="movie in equalQuery" :key="movie.id">
            {{ movie.title }}
          </li>
        </ul>
      </section>

      <hr>

      <section>
        <header>
          <h2>Lower Than query</h2>
          <code>
            queryContent('/').where({ release_date: { $lte: 1997 } }).find()
          </code>
        </header>
        <ul v-if="lowerThanQuery">
          <li v-for="movie in lowerThanQuery" :key="movie.id">
            {{ movie.title }} - {{ movie.release_date }}
          </li>
        </ul>
      </section>

      <hr>

      <section>
        <header>
          <h2>Not Equal query</h2>
          <code>
            queryContent('/').where({ director: { $ne: 'Hayao Miyazaki' } }).find()
          </code>
        </header>
        <ul v-if="notEqualQuery">
          <li v-for="movie in notEqualQuery" :key="movie.id">
            {{ movie.title }} - {{ movie.director }}
          </li>
        </ul>
      </section>

      <hr>

      <section>
        <header>
          <h2>In query</h2>
          <code>
            queryContent('/').where({ director: { $in: ['Hayao Miyazaki', 'Yoshifumi Kondō'] } }).find()
          </code>
        </header>
        <ul v-if="inQuery">
          <li v-for="movie in inQuery" :key="movie.id">
            {{ movie.title }} - {{ movie.director }}
          </li>
        </ul>
      </section>
    </main>
  </NuxtExampleLayout>
</template>

<style scoped>
hr {
  border: 0;
  border-top: 1px solid #eaeaea;
  margin: 1.5rem 0;
}

section > header {
  margin-bottom: 1.5rem;
}
</style>
