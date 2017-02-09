#!/usr/bin/env node

var path = require('path');
var express = require('express');
var app = express();
var fs = require('fs');

var config;
try {
  config = require(process.cwd() + '/maestro.config.js');
} catch (e) {
  config = {};
}
config.framework = config.framework || 'vue';
config.bundles = config.bundles || {};
config.bundles.scripts = config.bundles.scripts || 'bundle.js';
config.bundles.styles = config.bundles.styles || 'bundle.css';

var webpack = require('webpack');
var webpackConfig = require('./webpack.config.'+config.framework+'.js');
webpackConfig.entry = path.join(__dirname, '/' + config.framework + '.js');
webpackConfig.resolve = webpackConfig.resolve || {};
webpackConfig.resolve.alias = {
  'Src': path.join(process.cwd(), 'src')
};
// webpackConfig.resolve.modules = webpackConfig.resolve.modules || ['node_modules'];
// webpackConfig.resolve.modules.push(path.join(process.cwd(), 'src'));
// webpackConfig.context = process.cwd();
// webpackConfig.entry = webpackConfig.entry || './react.js';
// webpackConfig.output = webpackConfig.output || {};
// webpackConfig.output.filename = webpackConfig.output.filename || 'bundle.js';
// webpackConfig.output.library = webpackConfig.output.library || 'html';
// webpackConfig.output.libraryTarget = webpackConfig.output.libraryTarget || 'commonjs';
// webpackConfig.target = 'node';
var webpackCompiler = webpack(webpackConfig);
var webpackDevMiddleware = require('webpack-dev-middleware');
var middleware = webpackDevMiddleware(webpackCompiler, {
  publicPath: '/assets/',
  serverSideRender: true,
  stats: {
    colors: true
  }
});

app.use((req, res, next) => {
  process.env.REQUEST_URI = req.url.replace(/^\/css/, '').replace(/^\/pattern/, '');
  process.env.DEBUG = true;
  next();
});

app.use(middleware);

function getPatternHtml (source, callback) {
  var scriptBundle = config.bundles.scripts || 'bundle.js';
  var Module = module.constructor;
  var m = new Module();
  m._compile(source, scriptBundle);
  m.exports.html(callback);
}

app.use((req, res, next) => {
  var source = false;
  var styleBundle = config.bundles.styles || 'bundle.css';
  var scriptBundle = config.bundles.scripts || 'bundle.js';

  // console.log('recompile ', req.url);
  // console.log('stats', res.locals.webpackStats.compilation.assets[styleBundle]);

  if (req.originalUrl.match(/^\/css/)) {
    source = res.locals.webpackStats.compilation.assets[styleBundle].source();
    res.set('Content-type', 'text/css').send(source);
  } else if (req.originalUrl.match(/^\/pattern/)) {
    source = res.locals.webpackStats.compilation.assets[scriptBundle].source();
    getPatternHtml(source, function (error, html) {
      res.send(html);
    });
  } else {
    source = res.locals.webpackStats.compilation.assets[scriptBundle].source();
    getPatternHtml(source, function (error, html) {
      res.send('<link rel="stylesheet" type="text/css" href="/css'+req.url+'">' + html);
    });
  }
});

// app.get('/', function (req, res) {
//   res.send('Hello World! <script src="/assets/bundle.js"></script>');
// });

app.listen(3000, function () {
  console.log('Maestro is listening on port 3000!');
});
