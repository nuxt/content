<template>
  <div style="border: 1px solid #16a34a; background: #f0fdf4; color: #14532d; padding: 8px; margin-bottom: 1rem">
    <strong>Bundled component</strong> (<code>components/content/bundled.vue</code>): ✅ best practice
    <p>
      A local content component without <code>.lazy</code>, so it's imported statically into
      <code>localComponents</code>. It ships in the same chunk as ContentRenderer
      and is available on the first render with no extra request.
    </p>
    <p>
      Use this by default for content components.
    </p>
  </div>
</template>
