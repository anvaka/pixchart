var eventify = require('ngraph.events');
var createShaders = require('./lib/createShaders');
var glUtils = require('./lib/gl-utils.js');
var loadImage = require('./lib/loadImage');
var loadParticles = require('./lib/loadParticles');

module.exports = pixChart;

function pixChart(imageLink, canvas) {
  // 'https://i.imgur.com/vOaDMFa.jpg'
  var ctxOptions = {};
  var gl = canvas.getContext('webgl', ctxOptions) || canvas.getContext('experimental-webgl', ctxOptions);

  var state = 1; // expand
  var framesCount = 90;

  var shaders = createShaders();
  var screenProgram = glUtils.createProgram(gl, shaders.vertexShader, shaders.fragmentShader);
  var scaleImage = true;
  var width, height;

  window.addEventListener('resize', updateWidths, true);

  var progress = {
    total: 0,
    current: 0,
    step: 'image'
  };

  loadImage(imageLink, scaleImage).then(image => {
      progress.total = image.width * image.height;
      progress.step = 'pixels';
      api.fire('load-progress', progress);

      return loadParticles(image, framesCount, reportImageStatsProgress)
        .then(stats => {
        progress.step = 'done';
        api.fire('load-progress', progress);
        return {
          texture: glUtils.createTexture(gl, image),
          stats: stats,
          width: image.width,
          height: image.height
        };
      })
  }).then(start);

  var api = {
    dispose,
    webglEnabled: !!gl
  };

  eventify(api);

  return api;

  

  function reportImageStatsProgress(processedPixels) {
    progress.current = processedPixels;
    api.fire('load-progress', progress);
  }

  function dispose() {
    window.removeEventListener('resize', updateWidths, true);
  }

  function updateWidths() {
    gl.uniform4f(screenProgram.u_sizes, width, height, window.innerWidth, window.innerHeight);
  }

  function start(imgInfo) {
    width = imgInfo.width, height = imgInfo.height;
    
    var frame = 0;
    var numParticles = width * height; 

    var particleIndices = new Float32Array(numParticles);
    for (var i = 0; i < numParticles; i++) particleIndices[i] = i;
    
    var particleIndexBuffer = glUtils.createBuffer(gl, particleIndices);
    var particleInfoBuffer = glUtils.createBuffer(gl, imgInfo.stats.particleInfo);
  
    gl.useProgram(screenProgram.program);  
    
    glUtils.bindAttribute(gl, particleInfoBuffer, screenProgram.a_particle, 3);  
    glUtils.bindAttribute(gl, particleIndexBuffer, screenProgram.a_index, 1);

    glUtils.bindTexture(gl, imgInfo.texture, 2);
    gl.uniform1f(screenProgram.u_frame, frame);
    gl.uniform1f(screenProgram.u_max_y_value, imgInfo.stats.maxYValue);
    gl.uniform4f(screenProgram.u_sizes, width, height, window.innerWidth, window.innerHeight);

    gl.uniform1i(screenProgram.u_screen, 2);
    gl.uniform2f(screenProgram.texture_resolution, width, height);
    gl.drawArrays(gl.POINTS, 0, numParticles);

    requestAnimationFrame(animate);
    
    function animate() {
      gl.useProgram(screenProgram.program); 

      updateFrame();

      gl.uniform1f(screenProgram.u_frame, frame);
      gl.drawArrays(gl.POINTS, 0, numParticles);  
    }

    function updateFrame() {
      if (state === 1) {
        if (frame < framesCount) {
          frame += 1;
          requestAnimationFrame(animate);
        } else {
          frame = framesCount;
          state = 2;
          setTimeout(() => requestAnimationFrame(animate), 1000);
        }
      } else {
        if (frame > 0 ) {
            frame -= 1;
            requestAnimationFrame(animate);
        } else {
          state = 1;
          frame = 0;
          setTimeout(() => requestAnimationFrame(animate), 1000);
        }
      }
    }
  }


}