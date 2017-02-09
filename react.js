var patterns = require('../../maestro.patterns');
var React = require('react');
var renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;

var moduleSlug = process.env.REQUEST_URI.replace(/^\//, '');
var Pattern = patterns[moduleSlug];

module.exports = function (callback) {
  if (Pattern) {
    callback(null, renderToStaticMarkup(React.createElement(Pattern)));
  }
  else {
    callback(404, '');
  }
};
