<template>
  <div>
    <div style="display: flex; align-items: center">
      <div style="font-size: 64px;">
        ❕
      </div>
      <div>
        <h3 style="margin: 0">
          <Markdown :use="$slots.title" unwrap="p" />
        </h3>
        <div>
          <Markdown :use="$slots.default" unwrap="p" />
        </div>
      </div>
    </div>
  </div>
</template>
