// var eventify = require('ngraph.events');
var createShaders = require('./lib/createShaders');
var glUtils = require('./lib/gl-utils.js');
var loadImage = require('./lib/loadImage');
var loadParticles = require('./lib/loadParticles');

module.exports = pixChart;

function urlImage(link) {
  return {
    name: link,
    isUrl: true,
    getUrl() {
      return link
    }
  }
}

function fileImage(file) {
  return {
    name: file.name,
    getUrl() {
      return window.URL.createObjectURL(file);
    }
  }
}

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

  var state = 1; // expand
  var framesCount = 180;
  var nextAnimationFrame, pendingTimeout;
  var disposed = false;
  var particleLoaderSettings = {
    framesCount,
    isCancelled: false,
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

  loadImage(imageObject, scaleImage).then(image => {
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
      })
  })
  .then(start)
  .catch(error => {
    // TODO: this may not be necessary Image problem...
    console.error('error', error);
    progress.step = 'error'
    notifyProgress();
  })

  var api = {
    dispose,
    webglEnabled: !!gl
  };

  return api;

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

  function start(imgInfo) {
    if (disposed) return;

    width = imgInfo.width, height = imgInfo.height;
    
    var frame = 0;
    var numParticles = width * height; 

    var particleInfoBuffer = glUtils.createBuffer(gl, imgInfo.stats.particleInfo);
  
    gl.useProgram(screenProgram.program);  
    
    glUtils.bindAttribute(gl, particleInfoBuffer, screenProgram.a_particle, 4);  

    glUtils.bindTexture(gl, imgInfo.texture, 2);
    gl.uniform1f(screenProgram.u_frame, frame);
    gl.uniform1f(screenProgram.u_max_y_value, imgInfo.stats.maxYValue);
    gl.uniform4f(screenProgram.u_sizes, width, height, window.innerWidth, window.innerHeight);

    gl.uniform1i(screenProgram.u_screen, 2);
    gl.uniform2f(screenProgram.texture_resolution, width, height);
    gl.drawArrays(gl.POINTS, 0, numParticles);

    nextAnimationFrame = setTimeout(() => requestAnimationFrame(animate), 1000);
    
    function animate() {
      gl.useProgram(screenProgram.program); 
      if (requestSizeUpdate) {
        requestSizeUpdate = false;
        gl.uniform4f(screenProgram.u_sizes, width, height, window.innerWidth, window.innerHeight);
      }

      updateFrame();

      gl.uniform1f(screenProgram.u_frame, frame);
      gl.drawArrays(gl.POINTS, 0, numParticles);  
    }

    function updateFrame() {
      if (state === 1) {
        if (frame < framesCount) {
          frame += 1;
          nextAnimationFrame = requestAnimationFrame(animate);
        } else {
          frame = framesCount;
          state = 2;
          pendingTimeout = setTimeout(() => {
            nextAnimationFrame = requestAnimationFrame(animate);
          }, 1000);
        }
      } else {
        if (frame > 0 ) {
            frame -= 1;
            if (frame > 0) frame -= 2;
            nextAnimationFrame = requestAnimationFrame(animate);
        } else {
          state = 1;
          frame = 0;
          pendingTimeout = setTimeout(() => {
            nextAnimationFrame = requestAnimationFrame(animate)
          }, 1000);
        }
      }
    }
  }
}