export default defineNuxtPlugin(() => {
  const adBlocked = ref(false)

  onNuxtReady(async () => {
    if (await adsBlocked()) {
      adBlocked.value = true
    }
  })

  const adsBlocked = async () => {
    return await $fetch('https://cdn.carbonads.com/carbon.js?serve=CWYIPK7W&placement=contentnuxtcom', {
      method: 'HEAD',
      mode: 'no-cors'
    })
      .then(() => false)
      .catch(() => true)
  }

  return {
    provide: {
      ads: {
        adBlocked
      }
    }
  }
})
