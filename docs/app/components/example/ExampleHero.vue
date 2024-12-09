<template>
  <section class="pt-4">
    <h1 class="text-4xl">
      <slot mdc-unwrap="p" />
    </h1>
    <slot name="description" />
  </section>
</template>
