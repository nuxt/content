<template>
  <div>
    <div style="display: flex; align-items: center">
      <div style="font-size: 64px;">
        ❕
      </div>
      <div>
        <h3 style="margin: 0">
          <ContentRichSlot :use="$slots.title" unwrap="p" />
        </h3>
        <div>
          <ContentRichSlot :use="$slots.default" unwrap="p" />
        </div>
      </div>
    </div>
  </div>
</template>
