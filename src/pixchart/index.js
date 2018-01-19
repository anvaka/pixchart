var eventify = require('ngraph.events');
var createShaders = require('./lib/createShaders');
var glUtils = require('./lib/gl-utils.js');
var loadImage = require('./lib/loadImage');
var loadParticles = require('./lib/loadParticles');

var ANIMATION_COLLAPSE = 1;
var ANIMATION_EXPAND = 2;

module.exports = pixChart;

function pixChart(imageLink, options) {
  // 'https://i.imgur.com/vOaDMFa.jpg'

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

  // When initial state collapsed, we want to start expanding, and vice versa.
  var initialState = options.collapsed ? ANIMATION_EXPAND : ANIMATION_COLLAPSE;
  var state = initialState;

  var nextAnimationFrame, pendingTimeout;

  var disposed = false;
  var framesCount = options.framesCount || 120;

  var currentFrameNumber = state === ANIMATION_COLLAPSE ? 0 : framesCount;

  var particleLoaderSettings = {
    isCancelled: false,
    framesCount: framesCount,
    onProgress: reportImageStatsProgress,
    colorGroupBy: options.colorGroupBy
  }

  var progress = {
    imageObject: imageObject,
    total: 0,
    current: 0,
    step: 'image',
  };

  var requestSizeUpdate = false;

  // Image size can be different than scene size (e.g. image is smaller than screen)
  // Thus, we need to track them both.
  var imageWidth, imageHeight, minFrameSpan, maxFrameSpan, frameChangeRate;
  var imgInfo, particleAttributesBuffer;

  var sceneWidth = canvas.clientWidth;
  var sceneHeight = canvas.clientHeight;

  var scaleImage = options.scaleImage !== undefined ? options.scaleImage : true;
  var maxPixels = options.maxPixels;

  var shaders = createShaders();
  var screenProgram = glUtils.createProgram(gl, shaders.vertexShader, shaders.fragmentShader);

  var api = eventify({
    dispose,
    imageLink,
    restartCycle: startExpandCollapseCycle,
    setSceneSize: setSceneSize,
    setFramesCount,
    setMaxPixels,
    colorGroupBy
  });

  // So that any event handler are subscribed.
  setTimeout(startAnimationPipeline, 0);

  return api;

  function startAnimationPipeline() {
    loadImageWithCurrentOptions()
      .then(updateProgressAndLoadParticles)
      .then(initWebGLPrimitives)
      .then(startExpandCollapseCycle)
      .catch(error => {
        // TODO: this may not be necessary Image problem...
        console.error('error', error);
        progress.step = 'error'
        notifyProgress();
      });
  }

  function setMaxPixels(newMaxPixels) {
    maxPixels = newMaxPixels; // TODO: Validate?

    loadImageWithCurrentOptions()
      .then(updateProgressAndLoadParticles)
      .then(loadedImage => initWebGLPrimitives(loadedImage, /* keepCurrentFrame = */ true));
  }

  function loadImageWithCurrentOptions() {
    return loadImage(imageObject, {
      scaleImage,
      maxPixels
    })
  }

  function colorGroupBy(newColorGroupBy) {
    particleLoaderSettings.colorGroupBy = newColorGroupBy;

    loadImageWithCurrentOptions()
      .then(updateProgressAndLoadParticles)
      .then(initWebGLPrimitives);
  }

  function updateProgressAndLoadParticles(image) {
    progress.total = image.width * image.height;
    progress.step = 'pixels';
    notifyProgress();

    return loadParticles(image, particleLoaderSettings)
      .then(particles => {
        progress.step = 'done';
        notifyProgress();

        return {
          // Note: we are using particles.canvas here instead of image
          // because on smaller devices (like a phone) large images
          // can fail to load onto GPU (the texture is black). I'm not sure if using
          // canvas is going to have negative impact on quality. Need to keep an eye.
          texture: glUtils.createTexture(gl, particles.canvas),
          particles: particles,
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
    api.fire('loading-progress', progress);
  }

  function setFramesCount(newCount) {
    framesCount = Math.max(newCount, 1);
    frameChangeRate = (maxFrameSpan - minFrameSpan)/framesCount;
  }

  function setSceneSize(width, height) {
    canvas.width = width;
    canvas.height = height;
    sceneWidth = width;
    sceneHeight = height;

    requestAnimationFrame(() => {
      requestSizeUpdate = true;
      gl.viewport(0, 0, sceneWidth, sceneHeight);
      drawCurrentFrame();
    });
  }

  function initWebGLPrimitives(loadedImage, keepCurrentFrame) {
    if (disposed) return;
    canvas.style.opacity = 1;

    releasePreviousWebGLResources();

    imgInfo = loadedImage
    imageWidth = imgInfo.width, imageHeight = imgInfo.height;
    var particles = imgInfo.particles;
    minFrameSpan = particles.minFrameSpan;
    maxFrameSpan = particles.maxFrameSpan;
    frameChangeRate = (maxFrameSpan - minFrameSpan)/framesCount;

    particleAttributesBuffer = glUtils.createBuffer(gl, particles.particleAttributes);
    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
    gl.useProgram(screenProgram.program);  
    
    glUtils.bindAttribute(gl, particleAttributesBuffer, screenProgram.a_particle, 4);  
    glUtils.bindTexture(gl, imgInfo.texture, 2);

    if (!keepCurrentFrame) setInitialFrameNumber();

    gl.uniform4f(screenProgram.u_frame, currentFrameNumber, minFrameSpan, maxFrameSpan, state);

    gl.uniform1f(screenProgram.u_max_y_value, particles.maxYValue);
    gl.uniform4f(screenProgram.u_sizes, imageWidth, imageHeight, sceneWidth, sceneHeight);

    gl.uniform1i(screenProgram.u_image, 2);
    gl.drawArrays(gl.POINTS, 0, imageWidth * imageHeight);  
  }

  function animate() {
    nextAnimationFrame = 0;

    drawCurrentFrame();
    scheduleNextFrame();
  }

  function drawCurrentFrame() {
    gl.useProgram(screenProgram.program); 

    if (requestSizeUpdate) {
      requestSizeUpdate = false;
      gl.uniform4f(screenProgram.u_sizes, imageWidth, imageHeight, sceneWidth, sceneHeight);
    }

    gl.uniform4f(screenProgram.u_frame, currentFrameNumber, minFrameSpan, maxFrameSpan, state);
    gl.drawArrays(gl.POINTS, 0, imageWidth * imageHeight);  
  }

  function startExpandCollapseCycle() {
    // One cycle consists of collapsing image, and then expanding it.
    // After cycle is done, options.cycleComplete() callback is executed.

    // Note: we don't want to start animation immediately, so that users
    // can see the scene in its expanded or collapsed state.
    if (disposed) return;
    if (nextAnimationFrame || pendingTimeout) return; // already scheduled.

    pendingTimeout = setTimeout(() => {
      pendingTimeout = 0;
      nextAnimationFrame = requestAnimationFrame(animate)
    }, 1000);
  }
    
  function scheduleNextFrame() {
    // TODO: Simplify this code. It's remnant of older loop.
    // We want to pause when collapse or expand phase has finished.
    if (state === ANIMATION_COLLAPSE) {
      if (currentFrameNumber < maxFrameSpan) {
        currentFrameNumber += frameChangeRate;
        nextAnimationFrame = requestAnimationFrame(animate);
      } else {
        state = ANIMATION_EXPAND;
        completeState();
      }
    } else {
      if (currentFrameNumber < maxFrameSpan ) {
        currentFrameNumber += frameChangeRate;
        nextAnimationFrame = requestAnimationFrame(animate);
      } else {
        state = ANIMATION_COLLAPSE;
        completeState();
      }
    }
  }

  function setInitialFrameNumber() {
    currentFrameNumber = minFrameSpan;
  }

  function completeState() {
    setInitialFrameNumber();
    if (state === initialState) {
      // make a pause, let the clients re-trigger.
      api.fire('cycle-complete');
    } else {
      // drive it back to original state
      pendingTimeout = setTimeout(() => {
        pendingTimeout = 0;
        nextAnimationFrame = requestAnimationFrame(animate);
      }, 1000);
    }
  }

  function dispose() {
    cancelAnimationFrame(nextAnimationFrame);
    clearTimeout(pendingTimeout);
    releasePreviousWebGLResources();
    if (screenProgram) {
      screenProgram.unload();
    }

    canvas.style.opacity = 0;
    particleLoaderSettings.isCancelled = true;
    nextAnimationFrame = 0;
    pendingTimeout = 0;
    disposed = true;
  }

  function releasePreviousWebGLResources() {
    if (particleAttributesBuffer) {
      gl.deleteBuffer(particleAttributesBuffer);
      particleAttributesBuffer = null;
    }
    if (imgInfo) {
      gl.deleteTexture(imgInfo.texture);
      imgInfo = null;
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
