// var eventify = require('ngraph.events');
var createShaders = require('./lib/createShaders');
var glUtils = require('./lib/gl-utils.js');
var loadImage = require('./lib/loadImage');
var loadParticles = require('./lib/loadParticles');

var ANIMATION_COLLAPSE = 1;
var ANIMATION_EXPAND = 2;

module.exports = pixChart;

function pixChart(imageLink, options) {
  // 'https://i.imgur.com/vOaDMFa.jpg'

  // TODO: This needs to be more versatile
  var imageObject = typeof imageLink === 'string' ? urlImage(imageLink) : fileImage(imageLink);

  options = options || {};
  var canvas = options.canvas;
  if (!canvas) {
    throw new Error('Canvas is required');
  }
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    throw new Error('WebGL is not available');
  }

  var initialState = ANIMATION_COLLAPSE;
  var state = initialState;

  var nextAnimationFrame, pendingTimeout;

  var disposed = false;
  var framesCount = options.framesCount || 120;

  var currentFrameNumber = state === 1 ? 0 : framesCount;

  var particleLoaderSettings = {
    isCancelled: false,
    framesCount: framesCount,
    onProgress: reportImageStatsProgress
  }

  var progress = {
    imageObject: imageObject,
    total: 0,
    current: 0,
    step: 'image',
  };

  var scaleImage = options.scaleImage !== undefined ? options.scaleImage : true;
  var width, height;
  var requestSizeUpdate = false;

  var shaders = createShaders(window.devicePixelRatio);
  var screenProgram = glUtils.createProgram(gl, shaders.vertexShader, shaders.fragmentShader);

  loadImage(imageObject, scaleImage)
    .then(updateProgressAndLoadParticles)
    .then(initWebGLPrimitives)
    .then(startExpandCollapseCycle)
    .catch(error => {
      // TODO: this may not be necessary Image problem...
      console.error('error', error);
      progress.step = 'error'
      notifyProgress();
    });

  var api = {
    dispose,
    imageLink,
    restartCycle: startExpandCollapseCycle
  };

  return api;

  function updateProgressAndLoadParticles(image) {
    progress.total = image.width * image.height;
    progress.step = 'pixels';
    notifyProgress();

    return loadParticles(image, particleLoaderSettings)
      .then(stats => {
        progress.step = 'done';
        notifyProgress();

        return {
          texture: glUtils.createTexture(gl, image),
          stats: stats,
          width: image.width,
          height: image.height
        };
    });
  }

  function reportImageStatsProgress(processedPixels) {
    progress.current = processedPixels;
    notifyProgress();
  }

  function notifyProgress() {
    if (options.progress) { 
      options.progress(progress);
     }
  }

  function dispose() {
    cancelAnimationFrame(nextAnimationFrame);
    clearTimeout(pendingTimeout);

    particleLoaderSettings.isCancelled = true;
    nextAnimationFrame = null;
    pendingTimeout = null;
    disposed = true;
  }

  function initWebGLPrimitives(imgInfo) {
    if (disposed) return;

    width = imgInfo.width, height = imgInfo.height;

    var particleInfoBuffer = glUtils.createBuffer(gl, imgInfo.stats.particleInfo);
  
    gl.useProgram(screenProgram.program);  
    
    glUtils.bindAttribute(gl, particleInfoBuffer, screenProgram.a_particle, 4);  

    glUtils.bindTexture(gl, imgInfo.texture, 2);
    gl.uniform1f(screenProgram.u_frame, currentFrameNumber);
    gl.uniform1f(screenProgram.u_max_y_value, imgInfo.stats.maxYValue);
    gl.uniform4f(screenProgram.u_sizes, width, height, window.innerWidth, window.innerHeight);

    gl.uniform1i(screenProgram.u_screen, 2);
    gl.uniform2f(screenProgram.texture_resolution, width, height);
    gl.drawArrays(gl.POINTS, 0, width * height);  
  }

  function startExpandCollapseCycle() {
    nextAnimationFrame = setTimeout(() => requestAnimationFrame(animate), 1000);
  }
    
  function animate() {
    gl.useProgram(screenProgram.program); 
    if (requestSizeUpdate) {
      requestSizeUpdate = false;
      gl.uniform4f(screenProgram.u_sizes, width, height, window.innerWidth, window.innerHeight);
    }

    updateFrameNumber();

    gl.uniform1f(screenProgram.u_frame, currentFrameNumber);
    gl.drawArrays(gl.POINTS, 0, width * height);  
  }

  function updateFrameNumber() {
    if (state === 1) {
      if (currentFrameNumber < framesCount) {
        currentFrameNumber += 1;
        nextAnimationFrame = requestAnimationFrame(animate);
      } else {
        state = 2;
        completeState();
      }
    } else {
        if (currentFrameNumber > 0 ) {
          currentFrameNumber -= 1;
          if (currentFrameNumber > 0) currentFrameNumber -= 1;
          nextAnimationFrame = requestAnimationFrame(animate);
        } else {
          state = 1;
          completeState();
        }
      }
    }

    function completeState() {
      currentFrameNumber = state === 2 ? framesCount : 0;
      if (state === initialState) {
        // make a pause, let the clients re-trigger.
        if (options.cycleComplete) {
          options.cycleComplete();
        }
      } else {
        // drive it back to original state
        pendingTimeout = setTimeout(() => {
          nextAnimationFrame = requestAnimationFrame(animate);
        }, 1000);
      }
    }
}

// allows to load images from a url
function urlImage(link) {
  return {
    name: link,
    isUrl: true,
    getUrl() {
      return link
    }
  }
}

// this loads images from a local file
function fileImage(file) {
  return {
    name: file.name,
    getUrl() {
      return window.URL.createObjectURL(file);
    }
  }
}
