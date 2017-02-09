var renderer = require('vue-server-renderer').createRenderer();

var fs = require('fs');
var path = require('path');
var moduleSlug = process.env.REQUEST_URI.replace(/^\//, '');

// console.log('moduleSlug ', moduleSlug);

var Pattern = false;

moduleSlug = moduleSlug || 'index';

for (path of [
  {resolve: moduleSlug+'.vue', path: path.join(process.cwd(), 'src', moduleSlug + '.vue')},
  {resolve: moduleSlug+'/index.vue', path: path.join(process.cwd(), 'src', moduleSlug, 'index.vue')}
]) {
  try {
    fs.statSync(path.path)
    // console.log('about to require ', 'Src/'+path.resolve);
    Pattern = require('Src/'+path.resolve);
    break;
  }
  catch (e) { }
}
// moduleSlug = 'foo-component';
// Pattern = require(process.cwd() + '/src/' + moduleSlug + '.vue');

// console.log('Pattern', Pattern);

var Vue = require('vue');
var foo = new Vue({
  render: function (h) {
    return h(Pattern);
  }
});

module.exports = function (callback) {
  renderer.renderToString(foo, function (error, html) {
    if (error) {
      throw error;
    }

    callback(error, html);
  });
};
