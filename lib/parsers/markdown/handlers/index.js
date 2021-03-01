module.exports = highlighter => ({
  code: require('./code')(highlighter),
  paragraph: require('./paragraph'),
  html: require('./html')
})
