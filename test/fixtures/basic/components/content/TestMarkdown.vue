<template>
  <div>
    <h1 class="text-3xl font-bold text-primary-900 dark:text-primary-100">
      <ContentRichSlot :use="$slots.title" unwrap="p">
        Default title
      </ContentRichSlot>
    </h1>
    <p>
      <ContentRichSlot :use="$slots.default" unwrap="p">
        Default paragraph
      </ContentRichSlot>
    </p>
  </div>
</template>
