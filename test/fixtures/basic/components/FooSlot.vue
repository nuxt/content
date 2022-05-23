<template>
  <div>
    <div id="default-slot">
      <Markdown :use="$slots.default" />
    </div>
    <div id="foo-slot">
      <Markdown :use="$slots.foo" />
    </div>
  </div>
</template>
