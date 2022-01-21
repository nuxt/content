<template>
  <div class="d-sticky-footer-container">
    <AppHeader />

    <main class="flex-1 grid md:grid-cols-[280px_1fr]">
      <AppAside class="hidden md:block" />
      <div class="grid lg:grid-cols-[1fr_280px]">
        <div class="px-8">
          <div class="max-w-readable mx-auto">
            <div>
              <slot />
            </div>
          </div>
        </div>

        <!-- ToC -->
        <div class="hidden lg:block h-(screen-header) sticky top-16 border-l border-warmgray-900 p-8 overflow-auto">
          <span class="text-xl font-bold"> Table of Contents </span>
        </div>
      </div>
    </main>
  </div>
</template>
