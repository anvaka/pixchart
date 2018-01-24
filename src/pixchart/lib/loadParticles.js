/**
 * This is the core of particles preprocessing.
 * 
 * It asynchronously performs calculation of particles destinations.
 * Depending on a value function, the algorithm processes all particles
 * in just one pass (linear performance of particles count). If value function
 * needs normalization, then algorithm iterates over particles twice.
 */
var random = require('ngraph.random')(42);
var groupFunctions = require('./groupFunctions');

// How many milliseconds we are allowed to process the particles before
// giving control back to UI thread.
var MAX_THREAD_TIME_MS = 12; // Picked by hand.

module.exports = loadParticles;

function loadParticles(image, options) {
  if (!options) throw new Error('Options required');

  var actualResolve;
  var {onProgress, ignoredBuckets} = options;

  var {getValue, normalizeV, name: groupByFunctionName} = getGroupByFunction(options.colorGroupBy);
  var maxThreadTime = options.maxFrameSpan || MAX_THREAD_TIME_MS;

  var initIntervals = 0;

  console.time('init stats');

  var cnv = document.createElement('canvas');
  var width = cnv.width = image.width, height = cnv.height = image.height;
  var n = width * height;

  var bucketsCount = options.bucketCount || 42;
  var bucketWidth = Math.ceil(width/bucketsCount); // in pixels.

  var maxYValue = 0;  
  var nonFilteredMaxYValue = 0;
  var minVValue = Number.POSITIVE_INFINITY;
  var maxVValue = Number.NEGATIVE_INFINITY;
  
  var ctx = cnv.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height); 

  var pixels = ctx.getImageData(0, 0, width, height).data;
  var idx = 0;
  var minFrameSpan = Number.POSITIVE_INFINITY, maxFrameSpan = Number.NEGATIVE_INFINITY;

  // each pixel is mapped to height inside its bucket;
  var particleAttributes = new Float32Array(4 * n);

  // this is a temporary tracker of taken spots inside a bucket
  var bucketColors = new Uint32Array(bucketsCount);

  console.timeEnd('init stats');
  
  console.time('initParticles');

  if (normalizeV) {
    // TODO: Async?
    console.time('minmax');
    var pixelsCount = 4 * n;
    for (var i = 0; i < pixelsCount; i += 4) {
      var r = pixels[i + 0], g = pixels[i + 1], b = pixels[i + 2];
      var v = getValue(r, g, b);
      if (v < minVValue) minVValue = v;
      if (v > maxVValue) maxVValue = v;
    }
    console.timeEnd('minmax');
  } else {
    minVValue = 0;
    maxVValue = 1;
  }
  scheduleWork();
  
  return new Promise((resolve) => { actualResolve = resolve; });

  function getGroupByFunction(requestedGrouping) {
    if (typeof requestedGrouping === 'string') {
      requestedGrouping = groupFunctions[requestedGrouping];
    }
    if (typeof requestedGrouping === 'function') {
      return {
        name: 'custom',
        normalizeV: false,
        getValue: requestedGrouping
      };
    }
    if (requestedGrouping && typeof requestedGrouping.getValue === 'function') {
      return {
        normalizeV: requestedGrouping.normalize,
        getValue: requestedGrouping.getValue,
        name: requestedGrouping.name
      };
    }

    throw new Error('Unknown group by function');
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
    var pixelsCount = 4 * n;
    var isStochastic = options.stochastic;

    while (idx < pixelsCount) { 
      var invIndex = pixelsCount - idx - 4;
      var r = pixels[invIndex + 0], g = pixels[invIndex + 1], b = pixels[invIndex + 2];

      var v = (getValue(r, g, b) - minVValue)/(maxVValue - minVValue);
      // v ranges from 0 to 1.
      var bucketNumber = Math.round(v * bucketsCount);

      if (bucketNumber === bucketsCount) {
        // prevent overflow
        bucketNumber -= 1;
      }

      currentYValue = (bucketColors[bucketNumber] += 1);
      currentYValue -= 1;
      // assign this pixel to this height in the bucket
      // Note: if we want to be less jumpy during changes in particles count,
      // we can augment this code with previous particle configuration.
      var frameSpan = random.gaussian();

      particleAttributes[idx + 0] = (bucketNumber/bucketsCount) +
       (currentYValue % bucketWidth)/(bucketsCount * bucketWidth);
      particleAttributes[idx + 1] = Math.floor(currentYValue/bucketWidth);
      particleAttributes[idx + 2] = isStochastic ? frameSpan : 0;
      particleAttributes[idx + 3] = invIndex/4;

      if (frameSpan < minFrameSpan) minFrameSpan = frameSpan;
      if (frameSpan > maxFrameSpan) maxFrameSpan = frameSpan;

      var bucketMaxY = particleAttributes[idx + 1];
      // TODO: this should be based on custom callback.
      if (ignoredBuckets && ignoredBuckets.has(bucketNumber)) { 
        particleAttributes[idx] = -1;
      } else if (bucketMaxY > maxYValue) maxYValue = bucketMaxY;

      if (bucketMaxY > nonFilteredMaxYValue) nonFilteredMaxYValue = bucketMaxY;

      idx += 4;
      if (performance.now() - start > maxThreadTime) {
        scheduleWork();
        return;
      }  
    }

    console.timeEnd('initParticles');
    console.log('initialized in ' + initIntervals + ' intervals; Max Value:', maxYValue);
    console.log('Color range: ', minVValue, maxVValue);
    console.log('Lifespan range: ', minFrameSpan, maxFrameSpan);
    
    actualResolve({
      buckets: bucketColors,
      groupByFunctionName,
      minFrameSpan,
      maxFrameSpan,
      minVValue,
      maxVValue,
      particleAttributes: particleAttributes,
      canvas: cnv,
      maxYValue: maxYValue,
      nonFilteredMaxYValue,
      bucketWidth,
      ignoredBuckets
    })
  }
}