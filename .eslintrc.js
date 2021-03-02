module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module"
  },
  extends: ["@nuxtjs", "prettier"],
  plugins: ["prettier"],
  rules: {
    "vue/singleline-html-element-content-newline": 0,
    "vue/multiline-html-element-content-newline": 0,
    "vue/html-self-closing": 0,
    "vue/no-v-html": 0
  }
};
