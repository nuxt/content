<template>
  <div>
    <h1 class="text-3xl font-bold text-primary-900 dark:text-primary-100">
      <Markdown :use="$slots.title" unwrap="p">
        Default title
      </Markdown>
    </h1>
    <p>
      <Markdown :use="$slots.default" unwrap="p">
        Default paragraph
      </Markdown>
    </p>
  </div>
</template>
