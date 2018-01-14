var initScene = require('./scene');
var config = require('./config');

var canvas = document.getElementById('scene');
// Canvas may not be available in test run
if (canvas) initPixChart(canvas);

// Tell webpack to split bundle, and download settings UI later.
require.ensure('@/mainVue.js', () => {
  // Settings UI is ready, initialize vue.js application
  require('@/mainVue.js');
});

function initPixChart(canvas) {
  var width = window.innerWidth;
  var height = window.innerHeight;
  if (config.isSmallScreen()) {
    height -= config.sidebarHeight;
  } else {
    // large screens have sidebar on the left, need to remove some space
    // from canvas to account for the sidebar.
    width -= config.sidebarWidth;
  }
  canvas.width = width;
  canvas.height =  height;
  var ctxOptions = {antialias: false};

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