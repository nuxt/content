<template>
  <div>
    <nuxt-link to="/">Home</nuxt-link>
    <h2>Nuxt.js Shop</h2>

    <ul>
      <li
        v-for="product in products"
        :key="product.slug"
      >{{ product.title }} - {{ product.categories.map(category => category.slug).join(', ') }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  watchQuery: true,
  async asyncData ({ $content, route }) {
    const products = await $content('products')
      .where({ 'categories.slug': { $contains: ['top', 'man'] } })
      .fetch()

    return {
      products
    }
  }
}
</script>
