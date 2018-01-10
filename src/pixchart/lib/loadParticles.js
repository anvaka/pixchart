var chroma = require('chroma-js')

module.exports = loadParticles;

function loadParticles(image, framesCount, onProgress) {
  var actualResolve;

  var initIntervals = 0;

  console.time('init stats');

  var cnv = document.createElement('canvas');
  var width = cnv.width = image.width, height = cnv.height = image.height;
  var n = width * height;

  var bucketsCount = width; // TODO: Customize?

  var maxYValue = 0;  
  
  var ctx = cnv.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height); 

  var pixels = ctx.getImageData(0, 0, width, height).data;
  var idx = 0;

  // each pixel is mapped to height inside its bucket;
  var particleInfo = new Float32Array(3 * n);

  // this is a temporary tracker of taken spots inside a bucket
  var bucketColors = new Uint32Array(width);

  console.timeEnd('init stats');
  
  scheduleWork();
  
  return new Promise((resolve) => { actualResolve = resolve; });

  // TODO: Should be customizable.
  function getValue(r, g, b) {
    return chroma(r, g, b).get('hsl.l');
  }
  
  function scheduleWork() {
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
    
    actualResolve({
      particleInfo: particleInfo,
      maxYValue: maxYValue
    })
  }
}