<script setup lang="ts">
const preferNoBanner = ref(false)
</script>

<template>
  <div v-show="!preferNoBanner" class="banner-wrapper template-banner">
    <div class="content-wrapper">
      <NuxtLink to="https://nuxt.studio/?utm_source=content-site&utm_medium=banner&utm_campaign=home" target="_blank">
        <svg width="80" height="17" viewBox="0 0 80 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.264 16.5H23.1858C23.4692 16.5 23.7476 16.4261 23.993 16.2857C24.2384 16.1452 24.4422 15.9432 24.5838 15.7C24.7254 15.4567 24.7999 15.1808 24.7998 14.8999C24.7997 14.6191 24.7249 14.3432 24.5831 14.1001L18.5915 3.81436C18.4498 3.57116 18.2461 3.3692 18.0008 3.22878C17.7554 3.08836 17.4771 3.01443 17.1938 3.01443C16.9104 3.01443 16.6321 3.08836 16.3868 3.22878C16.1414 3.3692 15.9377 3.57116 15.7961 3.81436L14.264 6.44611L11.2686 1.29981C11.1269 1.05663 10.9231 0.854695 10.6777 0.714302C10.4322 0.573909 10.1539 0.5 9.8705 0.5C9.58713 0.5 9.30876 0.573909 9.06334 0.714302C8.81792 0.854695 8.6141 1.05663 8.47236 1.29981L1.01651 14.1001C0.874669 14.3432 0.799928 14.6191 0.799805 14.8999C0.799682 15.1808 0.874181 15.4567 1.01581 15.7C1.15744 15.9432 1.3612 16.1452 1.6066 16.2857C1.85201 16.4261 2.1304 16.5 2.41378 16.5H8.01415C10.2331 16.5 11.8695 15.534 12.9954 13.6494L15.7291 8.95721L17.1933 6.44611L21.5877 13.9889H15.7291L14.264 16.5ZM7.92285 13.9863L4.0145 13.9854L9.87311 3.92897L12.7963 8.95721L10.8391 12.318C10.0914 13.5408 9.24186 13.9863 7.92285 13.9863Z" fill="url(#paint0_linear_2964_17006)" />
          <path d="M32.7066 16.5C35.4333 16.5 37.2742 15.0642 37.2742 12.7703C37.2742 7.91998 30.883 9.98619 30.883 7.42969C30.883 6.71177 31.5256 6.22148 32.5503 6.22148C33.7139 6.22148 34.4433 6.85185 34.5302 7.81492H37.0137C36.9443 5.48605 35.1728 3.96266 32.5503 3.96266C30.0841 3.96266 28.3473 5.3985 28.3473 7.42969C28.3473 12.245 34.6517 10.4064 34.6517 12.8053C34.6517 13.7334 33.8702 14.2237 32.7066 14.2237C31.4214 14.2237 30.6051 13.4357 30.5009 12.1925H28C28.1042 14.8015 29.9452 16.5 32.7066 16.5Z" fill="currentColor" />
          <path d="M39.6553 7.53475H37.9707V9.56594H39.6553V13.1555C39.6553 15.2042 40.9579 16.3599 42.9725 16.3599H44.414V14.3112H43.3025C42.521 14.3112 42.0694 13.9085 42.0694 13.0505V9.56594H44.414V7.53475H42.0694V4.92572H39.6553V7.53475Z" fill="currentColor" />
          <path d="M51.5552 7.53475V12.3676C51.5552 13.4882 50.8084 14.3287 49.749 14.3287C48.759 14.3287 48.0643 13.5583 48.0643 12.4902V7.53475H45.6502V13.033C45.6502 15.0467 46.9354 16.5 48.898 16.5C50.0963 16.5 51.0689 15.9747 51.5552 15.1342V16.3599H53.9866V7.53475H51.5552Z" fill="currentColor" />
          <path d="M59.4923 16.5C60.4996 16.5 61.4027 16.0798 61.889 15.3969V16.3599H64.303V3.7H61.889V8.4628C61.4027 7.81492 60.5517 7.39467 59.4575 7.39467C56.9219 7.39467 55.3067 9.19823 55.3067 11.9473C55.3067 14.6964 56.9219 16.5 59.4923 16.5ZM59.8917 14.3988C58.6065 14.3988 57.7555 13.4182 57.7555 11.9473C57.7555 10.459 58.6065 9.47839 59.8917 9.47839C61.1769 9.47839 62.0279 10.459 62.0279 11.9473C62.0279 13.4182 61.1769 14.3988 59.8917 14.3988Z" fill="currentColor" />
          <path d="M66.1364 6.27401H68.7068V3.7H66.1364V6.27401ZM68.6373 16.3599V7.53475H66.2059V16.3599H68.6373Z" fill="currentColor" />
          <path d="M74.5802 16.5C77.2722 16.5 79.2 14.5739 79.2 11.9473C79.2 9.3208 77.2722 7.39467 74.5802 7.39467C71.8883 7.39467 69.9605 9.3208 69.9605 11.9473C69.9605 14.5739 71.8883 16.5 74.5802 16.5ZM74.5802 14.3988C73.2777 14.3988 72.3919 13.4007 72.3919 11.9473C72.3919 10.4765 73.2777 9.47839 74.5802 9.47839C75.8828 9.47839 76.7686 10.4765 76.7686 11.9473C76.7686 13.4007 75.8828 14.3988 74.5802 14.3988Z" fill="currentColor" />
          <defs>
            <linearGradient
              id="paint0_linear_2964_17006"
              x1="0.799805"
              y1="0.5"
              x2="25.155"
              y2="1.06027"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#36E4DA" />
              <stop offset="1" stop-color="#407CFF" />
            </linearGradient>
          </defs>
        </svg>
      </NuxtLink>
      <p>
        <NuxtLink to="https://nuxt.studio/?utm_source=content-site&utm_medium=banner&utm_campaign=home" target="_blank">
          Edit your Nuxt Content websites in production with live preview
        </NuxtLink>
      </p>

      <NuxtLink to="https://nuxt.studio/?utm_source=content-site&utm_medium=banner&utm_campaign=home" target="_blank" class="link">
        Try it now!
      </NuxtLink>
    </div>

    <button class="close-button" @click="preferNoBanner = true">
      <Icon name="carbon:close" size="16" />
    </button>
  </div>
</template>

<style lang="ts">
  css({
    '.banner-wrapper': {
      display: 'flex',
      position: 'relative',
      zIndex: 50,
      borderBottom: '1px solid',
      background: 'white',
      minHeight: '43px',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomColor: '{color.gray.300}',
      padding: '{size.8}',

      '@dark': {
          background: 'var(--elements-backdrop-background)',
          borderBottomColor: '{color.gray.700}',
      },

      '> .content-wrapper': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',

        gap: '{space.3}',

        '@sm': {
          flexDirection: 'row',
        },

        '> p': {
          color: 'black',
          fontWeight: '{fontWeight.regular}',
          fontSize: '{fontSize.sm}',
          textAlign: 'center',

          '@dark': {
            color: 'white'
          }
        },

        '> img': {
          paddingBottom: '{size.4}',
        },

        '> .logo-light': {
          '@dark': {
            display: 'none',
          }
        },

        '> .logo-dark': {
          display: 'none',

          '@dark': {
            display: 'block',
          }
        },

        '> .link': {
          borderRadius: '{radii.xs}',
          border: '1px solid',
          borderColor: '{color.gray.300}',
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '{size.4} {size.8} {size.4} {size.8}',
          color: '{color.gray.800}',
          fontSize: '{fontSize.xs}',
          transition: 'background-color 100ms linear',

          '&:hover': {
            backgroundColor: '{color.gray.50}',
            borderColor: '{color.gray.400}',
          },

          '@dark': {
            color: '{color.gray.200}',
            borderColor: '{color.gray.700}',

            '&:hover': {
              backgroundColor: '{color.gray.800}',
              borderColor: '{color.gray.600}',
            }
          },
        },
      },

      '.close-button': {
        alignSelf: 'flex-start',

        '@md': {
          alignSelf: 'center',
        },

        '> .icon': {
          transition: 'color 100ms linear',
          color: '{color.gray.500}',

          '&:hover': {
            color: '{color.gray.700}',
          },

          '@dark': {
            color: '{color.gray.400}',

            '&:hover': {
              color: '{color.gray.300}'
            }
          }
        }
      }
    },
  })
</style>

<style>
.hide-banner .template-banner{
  display: none;
}
</style>
