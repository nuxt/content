<template>
  <div>
    <h1 class="text-3xl font-bold text-primary-900 dark:text-primary-100">
      <ContentSlot :use="$slots.title" unwrap="p">
        Default title
      </ContentSlot>
    </h1>
    <p>
      <ContentSlot :use="$slots.default" unwrap="p">
        Default paragraph
      </ContentSlot>
    </p>
  </div>
</template>
