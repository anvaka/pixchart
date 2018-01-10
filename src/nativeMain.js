var initScene = require('./scene');
var bus = require('./bus');

var canvas = document.getElementById('scene');
// Canvas may not be available in test run
if (canvas) initPixChart(canvas);

// Tell webpack to split bundle, and download settings UI later.
require.ensure('@/mainVue.js', () => {
  // Settings UI is ready, initialize vue.js application
  require('@/mainVue.js');
});

function initPixChart(canvas) {
  canvas.width = window.innerWidth;
  canvas.height =  window.innerHeight;
  var ctxOptions = {};

  var gl = canvas.getContext('webgl', ctxOptions) ||
          canvas.getContext('experimental-webgl', ctxOptions);

  if (gl) {
    window.webGLEnabled = true;
    var scene = initScene(canvas);
    // scene.start();
    window.scene = scene;
  } else {
    window.webGLEnabled = false;
  }
}