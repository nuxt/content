/*
** TailwindCSS Configuration File
**
** Docs: https://tailwindcss.com/docs/configuration
** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
*/
module.exports = {
  theme: {
    darkSelector: '.dark-mode'
  },
  variants: {
    margin: ['responsive', 'last'],
    backgroundColor: ['responsive', 'hover', 'focus', 'dark', 'dark-focus'],
    textColor: ['responsive', 'hover', 'focus', 'dark', 'dark-hover'],
    borderColor: ['responsive', 'hover', 'focus', 'dark', 'dark-focus'],
    borderWidth: ['responsive', 'first', 'last']
  },
  plugins: [
    require('tailwindcss-dark-mode')()
  ]
}
