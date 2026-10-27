<template>
  <div style="border: 1px solid #ca8a04; background: #fefce8; color: #713f12; padding: 8px; margin-bottom: 1rem">
    <strong>Chunked component</strong> (<code>components/content/chunked.lazy.vue</code>): ⚠️ use when needed
    <p>
      The <code>.lazy</code> suffix turns it into an <code>async () =&gt; import()</code> loader in
      <code>localComponents</code>. It gets its own chunk, which is loaded only when a document uses
      <code>::chunked</code>, and the loader is wrapped in <code>defineAsyncComponent</code> once and cached.
    </p>
    <p>
      Use it for big components, or components used on only some pages, so they don't weigh down every page.
    </p>
  </div>
</template>
