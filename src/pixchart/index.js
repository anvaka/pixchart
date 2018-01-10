var chroma = require('chroma-js')
var createShaders = require('./lib/createShaders');
var glUtils = require('./lib/gl-utils.js');
var rgb2hsl = require('./lib/rgb2hsl');

module.exports = pixChart;

function pixChart(imageLink, canvas) {
  // 'https://i.imgur.com/vOaDMFa.jpg'
  var ctxOptions = {};
  var gl = canvas.getContext('webgl', ctxOptions) ||
      canvas.getContext('experimental-webgl', ctxOptions);

  var state = 1; // expand
  var framesCount = 90;

  var shaders = createShaders();
  var screenProgram = glUtils.createProgram(gl, shaders.vertexShader, shaders.fragmentShader);
  var scaleImage = true;

  function getValue(r, g, b) {
    // return chroma(r, g, b).luminance();//.get('hsl.l');
    return rgb2hsl(r/255., g/255., b/255.)[2];
  }

  loadTexture(gl, imageLink).then(start);

  function start(imgInfo) {
    var width = imgInfo.width, height = imgInfo.height;
    
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
          //if (frame > 0) frame -= 1;
            requestAnimationFrame(animate);
        } else {
          state = 1;
          frame = 0;
          setTimeout(() => requestAnimationFrame(animate), 1000);
        }
      }
      gl.uniform1f(screenProgram.u_frame, frame);
      gl.drawArrays(gl.POINTS, 0, numParticles);  
    }
  }

  function loadTexture(gl, url) {
    var resolveTexture, rejectTexture;

    var image = new Image();
    image.crossOrigin = '';

    image.onload = imageLoaded;
    image.onerror = reportError;
    image.src = url;

    return new Promise((resolve, reject) => {
      resolveTexture = resolve;
      rejectTexture = reject; 
    });
  
    function reportError(err) {
      rejectTexture(err);
    }
    
    function imageLoaded() {
      if (scaleImage) {
        // scaling image may change/distort colors.
        var sx = window.innerWidth/image.width;
        var sy = window.innerHeight/image.height;
        if (sx < sy) {
          image.width *= Math.min(sx, 2);
          image.height *= Math.min(sx, 2);
        } else {
          image.width *= Math.min(sy, 2);
          image.height *= Math.min(sy, 2);
        }
      }
      computeStats(image).then(bindTexture);
    }

    function bindTexture(stats) {
      var texture = gl.createTexture();
      var level = 0;
      var internalFormat = gl.RGBA;
      var srcFormat = gl.RGBA;
      var srcType = gl.UNSIGNED_BYTE;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      resolveTexture({
        texture: texture,
        stats: stats,
        width: image.width,
        height: image.height
      });
    }
  }

  function computeStats(image) {
    var actualResolve;

    var initIntervals = 0;
    console.time('init stats');
    var cnv = document.createElement('canvas');
    var width = cnv.width = image.width, height = cnv.height = image.height;
    var bucketsCount = width;
    var ctx = cnv.getContext('2d');
    var maxYValue = 0;  
    
    ctx.drawImage(image, 0, 0, image.width, image.height); 
    var pixels = ctx.getImageData(0, 0, width, height).data;
    var n = width * height;
    var idx = 0;// (n - 1) * 4;
    // each pixel is mapped to height inside its bucket;
    var particleInfo = new Float32Array(3 * n);
    // this is a temporary tracker of taken spots inside a bucket
    var bucketColors = new Uint32Array(width);
    console.timeEnd('init stats');
    
    scheduleWork();
    
    return new Promise((resolve) => { actualResolve = resolve; });
    
    function scheduleWork() {
      initIntervals += 1;
      setTimeout(processPixels, 0);
    }
    
    function processPixels() {
      var start = performance.now(); 
      var currentYValue;
      while (idx < 4*n) { 
        var r = pixels[idx + 0], g = pixels[idx + 1], b = pixels[idx + 2];
        var v = getValue(r, g, b);
        // v ranges from 0 to 1.
        var bucketNumber = Math.round(v * bucketsCount);
        if (bucketNumber === bucketsCount) bucketNumber -= 1;
        currentYValue = bucketColors[bucketNumber] += 1;
        // assign this pixel to this height in the bucket
        var pixelIndex = idx/4;
        var bIndex = 3 * pixelIndex;
        var rnd = Math.random();// * Math.abs(0.5 -v);
        particleInfo[bIndex + 0] = bucketNumber;
        particleInfo[bIndex + 1] = currentYValue - 1;
        particleInfo[bIndex + 2] = framesCount/2 + rnd * (framesCount/2);

        
        idx += 4;
        if (v === 0.) { 
            particleInfo[bIndex] = -1;
        } else if (currentYValue > maxYValue) maxYValue = currentYValue;
        if (performance.now() - start > 12) {
          scheduleWork();
          return;
        }  
      }
      
      console.log('initialized in ' + initIntervals + ' intervals; Max Value:', maxYValue);
      //document.body.style.backgroundColor = chroma(ha/n, 1.4*sa/n, 0.5 *va/n, 'hcl').hex();
      
      actualResolve({
        particleInfo: particleInfo,
        maxYValue: maxYValue
      })
    }
  }

}