<script setup lang="ts">
const preferNoBanner = () => {
  localStorage.setItem('preferNoVueCertificationBanner', 'true')
  document.querySelector('html')?.classList.add('hide-banner')
}

if (process.server) {
  useHead({
    script: [
      {
        key: 'prehydrate-template-banner',
        innerHTML: `
            if (localStorage.getItem('preferNoVueCertificationBanner') === 'true') {
              document.querySelector('html').classList.add('hide-banner')
            }`.replace(/\s+/g, ' '),
        type: 'text/javascript'
      }
    ]
  })
}
</script>

<template>
  <div class="banner-wrapper template-banner">
    <div class="content-wrapper">
      <img src="/studio-logo-light.svg" width="74" height="16" alt="studio logo" class="logo-light">
      <img src="/studio-logo-dark.svg" width="74" height="16" alt="studio logo" class="logo-dark">

      <p>
        Edit your Nuxt Content websites in production with live preview
      </p>

      <NuxtLink to="https://nuxt.studio/" target="_blank" class="link">
        Try it now!
      </NuxtLink>
    </div>

    <button class="close-button" @click="preferNoBanner">
      <Icon name="carbon:close" size="16" />
    </button>
  </div>
</template>

<style lang="ts">
  css({
    '.banner-wrapper': {
      display: 'flex',
      position: 'relative',
      zIndex: 9999,
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
          fontWeight: '{fontWeight.semibold}',
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
            backgroundColor: '{color.gray.50}'
          },

          '@dark': {
            color: '{color.gray.200}',
            borderColor: '{color.gray.700}',

            '&:hover': {
              backgroundColor: '{color.gray.900}'
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
