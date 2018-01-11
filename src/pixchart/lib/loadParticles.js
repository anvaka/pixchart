var chroma = require('chroma-js')

module.exports = loadParticles;

function loadParticles(image, options) {
  if (!options) throw new Error('Options required');

  var actualResolve;
  var {framesCount, onProgress} = options;

  var initIntervals = 0;

  console.time('init stats');

  var cnv = document.createElement('canvas');
  var width = cnv.width = image.width, height = cnv.height = image.height;
  var n = width * height;

  var bucketsCount = n; // TODO: Customize?

  var maxYValue = 0;  
  
  var ctx = cnv.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height); 

  var pixels = ctx.getImageData(0, 0, width, height).data;
  var idx = 0;

  // each pixel is mapped to height inside its bucket;
  var particleInfo = new Float32Array(4 * n);

  // this is a temporary tracker of taken spots inside a bucket
  var bucketColors = new Uint32Array(bucketsCount);

  console.timeEnd('init stats');
  
  console.time('initParticles');
  scheduleWork();
  
  return new Promise((resolve) => { actualResolve = resolve; });

  // TODO: Should be customizable.
  function getValue(r, g, b) {
    return b/255;
    return chroma(r, g, b).get('lch.c')/80;
  }
  
  function scheduleWork() {
    if (options.isCancelled) return;

    initIntervals += 1;
    if (initIntervals % 10 === 0) {
      onProgress(idx/4);
    }

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

      if (bucketNumber === bucketsCount) {
        // prevent overflow
        bucketNumber -= 1;
      }

      currentYValue = bucketColors[bucketNumber] += 1;
      // assign this pixel to this height in the bucket
      var pixelIndex = idx/4;
      var rnd = Math.random();// * Math.abs(0.5 -v);
      particleInfo[idx + 0] = v;
      particleInfo[idx + 1] = currentYValue - 1;
      particleInfo[idx + 2] = framesCount/2 + rnd * (framesCount/2);
      particleInfo[idx + 3] = pixelIndex;

      idx += 4;
      if (v === 0.) { 
        // TODO: Proper ignore logic here.
        particleInfo[idx] = -1;
      } else if (currentYValue > maxYValue) maxYValue = currentYValue;
      if (performance.now() - start > 42) {
        scheduleWork();
        return;
      }  
    }
    
    console.timeEnd('initParticles');
    console.log('initialized in ' + initIntervals + ' intervals; Max Value:', maxYValue);
    
    actualResolve({
      particleInfo: particleInfo,
      maxYValue: maxYValue
    })
  }
}