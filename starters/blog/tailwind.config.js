/*
** TailwindCSS Configuration File
**
** Docs: https://tailwindcss.com/docs/configuration
** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
*/
module.exports = {
  theme: {
    darkSelector: '.dark-mode',
    extend: {
      colors: {
        nuxt: {
          gray: '#243746',
          lightgreen: '#41B38A',
          green: '#158876'
        }
      }
    }
  },
  variants: {
    margin: ['responsive', 'last'],
    backgroundColor: ['responsive', 'hover', 'focus', 'dark'],
    textColor: ['responsive', 'hover', 'focus', 'dark', 'dark-hover'],
    borderColor: ['responsive', 'hover', 'focus', 'dark']
  },
  plugins: [
    require('tailwindcss-dark-mode')()
  ]
}
