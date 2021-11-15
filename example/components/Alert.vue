<template>
  <div class="alert" :class="type">
    <Markdown unwrap="p" />
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'info'
    }
  }
}
</script>

<style scoped>
.alert {
  padding: 1rem;
  border-radius: 5px;
}
.info {
  background: #acdffa;
}
.success {
  background: #acfab2;
}
.warning {
  background: #faacac;
}
</style>
