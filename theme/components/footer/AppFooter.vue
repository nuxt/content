<template>
  <footer class="py-8 md:pt-24 md:pb-12 border-t mt-24">
    <div class="d-container-content grid grid-cols-2 lg:grid-cols-8 mb-8">
      <FooterLogo class="col-span-2 lg:col-span-2 mb-8" />

      <div class="col-span-2 lg:col-start-3 lg:col-span-4">
        <FooterNavigation class="hidden md:block" :navigation="footerNavigationData" />
        <!-- <FooterMobileNavigation :navigation="footerNavigationData" class="mb-8 md:hidden" /> -->
      </div>

      <div class="col-span-2 lg:col-span-2">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquam assumenda unde autem nisi tenetur, doloremque
        dolorem. Cumque delectus eum, saepe sed deserunt quidem unde, a eligendi nisi exercitationem consequatur earum?
      </div>
    </div>
    <div class="d-container-content">© Docus 2022. MIT License.</div>
  </footer>
</template>

<script setup>
const footerNavigationData = {
  One: [
    {
      title: 'One'
    },
    {
      title: 'Two'
    },
    {
      title: 'Three'
    }
  ],
  Two: [
    {
      title: 'One'
    },
    {
      title: 'Two'
    }
  ],
  Three: [
    {
      title: 'One'
    },
    {
      title: 'Two'
    },
    {
      title: 'Three'
    }
  ]
}
</script>
