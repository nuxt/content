<template>
  <header
    class="d-header transition-colors duration-200 border-b border-transparent"
    :class="[(!onTop || $route.path !== '/') && 'border-warmgray-900 d-header-bg']"
  >
    <div class="grid grid-cols-12 items-center h-full d-container-padded">
      <div class="col-span-6 lg:col-span-3">
        <NuxtLink to="/" class="text-xl font-medium uppercase">
          <IconDocus />
        </NuxtLink>
      </div>

      <div class="hidden lg:block lg:col-span-6">
        <nav class="">
          <ul class="flex justify-center">
            <li>
              <NuxtLink
                to="/get-started"
                :class="[
                  'text-lg py-1 px-3 hover:text-primary-500',
                  {
                    'text-warmgray-600': $route.path !== '/get-started',
                    'text-primary-500': $route.path === '/get-started'
                  }
                ]"
              >
                Get Started
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="col-span-6 lg:col-span-3 flex justify-end">
        <HeaderNavMobile class="flex lg:hidden" />
        <ColorSwitcher class="hidden lg:block" />
      </div>
    </div>
  </header>
</template>

<script setup>
const onTop = ref(true)

function setOnTop() {
  if (window.pageYOffset <= 0) {
    onTop.value = true
  } else {
    onTop.value = false
  }
}

onMounted(() => {
  setOnTop()
  document.addEventListener('scroll', setOnTop)
})

onUnmounted(() => {
  document.removeEventListener('scroll', setOnTop)
})
</script>
