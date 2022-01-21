<template>
  <div class="">
    <div class="mb-3">
      <h3 class="font-semibold mb-1.5 font-whyte">Stay tuned</h3>
      <p class="d-text-secondary">Get latest news</p>
    </div>
    <div class="flex max-w-96">
      <AppTextInput :value="email" placeholder="Enter Your Email" class="mr-2 w-full" @input="updateEmail" />
      <AppButton appearance="contrast" class="">Submit</AppButton>
    </div>
  </div>
</template>

<script setup>
const email = ref('')
function updateEmail(e) {
  email.value = e
}
</script>
