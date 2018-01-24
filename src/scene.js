/**
 * This is "the brain" of the animation. It manages all parts of the 
 * animation configuration and workflows.
 */
var queryState = require('query-state');
var pixChart = require('./pixchart/index');
var config = require('./config.js');
var makeStats = require('./lib/makeStats');
var createFileDropHandler = require('./lib/fileDrop');
var formatNumber = require('./lib/formatNumber');
var getBestMaxPixels = require('./lib/getBestMaxPixels');
var customInterpolation = require('./lib/customInterpolation');
var bus = require('./bus');

var DEFAULT_ANIMATION_DURATION = 2.0; // in seconds, because visible to users
var DEFAULT_BUCKET_COUNT = 510;
var PAUSE_BETWEEN_CYCLES = 1000; // in milliseconds, because for developers
var qs = queryState({
  d: DEFAULT_ANIMATION_DURATION
}, {useSearch: true});

module.exports = initScene;

function initScene(canvas) {
  var currentPixChart;
  var cleanErrorClass = false;
  var progressElement = document.getElementById('progress');
  var queue = [];
  var lastIndex = 0;
  var pendingTimeout;

  var url = qs.get('link')

  if (url) {
    queue = [url];
    pendingTimeout = setTimeout(processNextInQueue, 0);
  }

  listenToEvents();

  var dropHandler = createFileDropHandler(document.body, handleDroppedFiles);
  var ignoredBuckets = readIgnoredBuckets(qs.get('ignore'));
  // If this is first time loading, respect the ignore buckets.
  var keepIgnoreBuckets = ignoredBuckets.size > 0;
  var knownAnimations = new Set([
    'linear-constant', 'linear-stochastic',
    'bezier-constant',  'bezier-stochastic'
  ])

  // This is the state of the application - primary interaction point between Vue <-> WebGL
  var state = {
    // State consists of two parts.

    // # Part 1 - Data
    image: url,
    // We don't want to overwhelm people with options
    // when they are browsing from mobile, so we close side bar on small screens
    sidebarOpen: !config.isSmallScreen(),
    duration: DEFAULT_ANIMATION_DURATION, 
    bucketCount: getSafeBucketCount(qs.get('bc')),
    maxPixels: getBestMaxPixels(),
    currentColorGroupBy: getSafeColorGroupBy(qs.get('groupBy')), 
    initialImageState: getSafeInitialState(qs.get('initial')),
    animationType: getSafeAnimationType(qs.get('atype')),
    paused: false,
    isFirstRun: queue.length === 0,
    isLocalFiles: false,

    /**
     * Requests to update scene dimensions.
     */
    updateSize,

    /**
     * Destroy scene and release all resources.
     */
    dispose,
    
    /**
     * Sets queue of images to play
     */
    setImages,

    /**
     * Sets duration of single animation step (expand or collapse)
     */
    setAnimationDuration,

    /**
     * Sets animation type from a set of predefined types
     */
    setAnimationType,

    /**
     * Sets how many buckets should we use in the histogram.
     */
    setBucketCount,

    /**
     * Sets maximum allowed amount of pixels.
     */
    setMaxPixels,

    /**
     * Sets grouping method (rgb.r, hsv.h, etc.)
     */
    setColorGroupBy,

    /**
     * Sets how scene should be rendered when ready. 
     */
    setInitialState,

    ignoreBucket, // WIP
    getStatistics,// WIP
  };

  setAnimationDuration(qs.get('d'));

  // Yeah, this is not very good. But hey - this is a toy project. Adding abstraction
  // layers isn't always good.
  window.sceneState = state;

  return; // We are done with public part.

  function getSafeAnimationType(rawInput) {
    if (knownAnimations.has(rawInput)) return rawInput;
    return 'linear-stochastic';
  }

  function readIgnoredBuckets(bucketList) {
    var ignoredBucketSet = new Set();
    if (!bucketList) return ignoredBucketSet;
    if (typeof bucketList === 'number') {
      ignoredBucketSet.add(bucketList);
      return ignoredBucketSet;
    }

    var buckets = bucketList.split('_')
    buckets.forEach(b => {
      var bucketNumber = Number.parseInt(b, 10);
      if (!Number.isNaN(bucketNumber)) ignoredBucketSet.add(bucketNumber);
    })

    return ignoredBucketSet;
  }

  function ignoreBucket(bucketsToToggle) {
    if (!bucketsToToggle) {
      // If they want to clear buckets - let's clear.
      clearIgnoreBuckets(/* keepQueryString */ true);
    }

    if (currentPixChart) {
      // `bucketsToToggle` may be null if they want to clear ignore buckets.
      toggleIgnoreBuckets(bucketsToToggle);

      keepIgnoreBuckets = true;
      restartCurrentAnimation(true);
      //currentPixChart.ignoreBucketSet(ignoredBuckets);
    }
    qs.set('ignore', Array.from(ignoredBuckets).join('_'));
  }

  function toggleIgnoreBuckets(buckets) {
    if (!buckets) return; // this is okay, means they are just clearing filters;

    if (!Array.isArray(buckets)) buckets = [buckets];
    buckets.forEach(c => {
      if (ignoredBuckets.has(c.bucketNumber)) ignoredBuckets.delete(c.bucketNumber);
      else ignoredBuckets.add(c.bucketNumber);
    });
  }

  function getStatistics() {
    var particles = currentPixChart && currentPixChart.getParticles();
    if (particles) return makeStats(particles);
  }

  function setInitialState(newInitialState) {
    state.initialImageState = newInitialState;
    qs.set('initial', newInitialState);

    keepIgnoreBuckets = true;
    restartCurrentAnimation();
  }

  function getSafeInitialState(plainInput) {
    if (plainInput === 'collapsed') return plainInput
    return 'expanded';
  }

  function getSafeColorGroupBy(plainInput) {
    return plainInput || 'hsl.l';
  }

  function getSafeBucketCount(plainInput) {
    var parsedValue = Number.parseInt(plainInput, 10);
    if (Number.isNaN(parsedValue) || parsedValue < 1) return DEFAULT_BUCKET_COUNT;

    return parsedValue;
  }

  function setColorGroupBy(groupBy) {
    var safeGroupBy = getSafeColorGroupBy(groupBy); 
    state.currentColorGroupBy = safeGroupBy;
    qs.set('groupBy', state.currentColorGroupBy);

    restartCurrentAnimation();
  }

  function restartCurrentAnimation() {
    if (!queue.length) return;

    // TODO: Validate?
    lastIndex -= 1;
    if (lastIndex < 0) lastIndex = queue.length - 1;
    processNextInQueue(/* forceDispose = */true);
  }

  function handlePaste(e){
    var items = e.clipboardData.items;
    var files = [];
    var strings = [];
    for(var i = 0; i < items.length; ++i) {
      var file = items[i];
      if (file.kind === 'file') files.push(file.getAsFile());
      else if (file.kind === 'string' && file.type === 'text/plain') strings.push(file);
    }

    if (files.length > 0) e.preventDefault();
    if (files.length === 0 && strings.length === 1) {
      // they are trying to paste a link?
      strings[0].getAsString(s => {
        if (s && s.match(/^http?s:\//)) setImages([s]);
      })
    }

    handleDroppedFiles(files);
  }

  function handleDroppedFiles(files) {
    var images = files.filter(isImage)
    if (images.length > 0) {
      setImages(images);
    }
  }

  function isImage(file) {
    return file && file.type && file.type.indexOf('image/') === 0;
  }

  function listenToEvents() {
    window.addEventListener('paste', handlePaste, false);
    window.addEventListener('resize', updateSize);
    canvas.addEventListener('click', onCanvasClick);
    document.body.addEventListener('keydown', onKeyDown);
    bus.on('theme-changed', updateTheme);
  }

  function dispose() {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = 0;
    }
    window.removeEventListener('resize', updateSize);
    window.removeEventListener('paste', handlePaste, false);
    canvas.removeEventListener('click', onCanvasClick);
    document.body.removeEventListener('keydown', onKeyDown);
    bus.off('theme-changed', updateTheme)

    dropHandler.dispose();

    currentPixChart.dispose();
    currentPixChart = null;
  }

  function onKeyDown(e) {
    if (e.target !== document.body) return; // don't care

    if (e.which === 32) { // spacebar
      togglePaused({
        clientX: window.innerWidth/2,
        clientY: window.innerHeight/2,
      });
    } else if (e.which === 39) { // right arrow 
      processNextInQueue(true);
    } else if (e.which === 37) { // left arrow
      processPrevInQueue(true);
    }
  }

  function onCanvasClick(e) {
    if (currentPixChart) {
      e.preventDefault();
      e.stopPropagation();
      
      togglePaused(e);
    }
  }

  function togglePaused(e) {
    state.paused = currentPixChart.togglePaused();
    if (state.paused) {
      clearTimeout(pendingTimeout);
    }
    showLoadingProgress({
      step: state.paused ? 'paused' : 'unpaused'
    });
    bus.fire('pause-changed', state.paused, {
      x: e.clientX,
      y: e.clientY
    });
  }

  function updateSize() {
    if (currentPixChart) {
      var sideBarWidthOffset = (!state.sidebarOpen || config.isSmallScreen ()) ? 0: config.sidebarWidth;
      var sideBarHeightOffset = config.isSmallScreen() ? config.sidebarHeight : 0;
      currentPixChart.setSceneSize(window.innerWidth - sideBarWidthOffset, window.innerHeight - sideBarHeightOffset);
    }
  }

  function updateTheme(newTheme) {
    qs.set('theme', newTheme);
  }

  function showLoadingProgress(progress) {
    if (progress.step === 'pixels') {
      progressElement.innerText = 'Processed ' + formatNumber(progress.current) + ' pixels out of ' + formatNumber(progress.total);
    } else if (progress.step === 'done') {
      progressElement.style.opacity = '0';
      if (progress.imageObject.isUrl) {
        // other objects cannot be shared
        qs.set('link', progress.imageObject.name)
        state.image = progress.imageObject.name;
        state.isLocalFiles = false;
      } else {
        qs.set('link', '')
        state.image = '';
        state.isLocalFiles = true;
      }
      bus.fire('image-loaded');
    } else if (progress.step === 'error') {
      progressElement.classList.add('error');
      cleanErrorClass = true;
      progressElement.innerHTML = 'Could not load image :(. <br /> Try uploading it to <a href="https://imgur.com" target="_blank">imgur.com</a>?'
      if (queue.length > 1) {
        pendingTimeout = setTimeout(processNextInQueue, 500);
      }
    }  else if (progress.step === 'paused') {
      progressElement.style.opacity = '1';
      progressElement.innerHTML = 'Paused. Click anywhere to resume';
      document.body.classList.add('paused');
    } else if (progress.step === 'unpaused') {
      progressElement.style.opacity = '0';
      document.body.classList.remove('paused');
    }

    if (cleanErrorClass && progress.step !== 'error') {
      // Just so that we are not doing this too often
      cleanErrorClass = false;
      progressElement.classList.remove('error');
    }
  }

  function setImage(imageLink, forceDispose) {
    if (currentPixChart && imageLink === currentPixChart.imageLink && !forceDispose) {
      currentPixChart.restartCycle()
      return;
    }

    if (currentPixChart) {
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        pendingTimeout = 0;
      } 

      bus.fire('image-unloaded', currentPixChart);

      currentPixChart.dispose();
      pendingTimeout = setTimeout(() => {
        createPixChart(imageLink)
        pendingTimeout = 0;
      }, 250); // Give small time for fade animation to finish.
    } else {
      createPixChart(imageLink);
    }
  }

  function clearIgnoreBuckets(keepQueryString) {
    ignoredBuckets.clear();
    if (!keepQueryString) qs.set('ignore', Array.from(ignoredBuckets).join('_'));
  }

  function createPixChart(imageLink) {
    progressElement.innerText = 'Loading image...';
    progressElement.style.opacity = '1';

    // Only keep buckets first time. (TODO: this is a bit fragile)
    if (!keepIgnoreBuckets) clearIgnoreBuckets();
    keepIgnoreBuckets = false;

    var pixChartConfig = {
      canvas,
      colorGroupBy: state.currentColorGroupBy,
      scaleImage: true,
      bucketCount: state.bucketCount,
      ignoredBuckets,
      stochastic: isAnimationStochastic(),
      collapsed: state.initialImageState === 'collapsed',
      maxPixels: state.maxPixels,
      framesCount: toFrames(state.duration),
    };

    if (isBezierAnimation()) {
      pixChartConfig.interpolate = customInterpolation.bezierNoise; 
    } else if (isVoigram()) {
      pixChartConfig.interpolate = customInterpolation.voigram; 
    }

    currentPixChart = pixChart(imageLink, pixChartConfig);

    currentPixChart.on('cycle-complete', () => {
      pendingTimeout = setTimeout(processNextInQueue, PAUSE_BETWEEN_CYCLES);
    });
    currentPixChart.on('loading-progress', showLoadingProgress);
    currentPixChart.on('frame', notifyFrame);
  }

  function notifyFrame(t) {
    bus.fire('animation-frame', t);
  }

  function setImages(files) {
    state.isFirstRun = false;
    if (files.length === 0) return;
    // TODO: Queued images are not visible anywhere.
    //  Might need to improve UX around this area
    queue = files;
    lastIndex = 0;

    processNextInQueue();
  }

  function setAnimationType(animationType) {
    var safeType = getSafeAnimationType(animationType)
    if (safeType !== animationType) throw new Error('unknown animation ' + animationType);

    qs.set('atype', animationType);
    state.animationType = animationType;
    if (!currentPixChart) return;

    restartCurrentAnimation();
  }

  function isAnimationStochastic() {
    return state.animationType.indexOf('stochastic') > -1;
  }

  function isBezierAnimation() {
    return state.animationType.indexOf('bezier') > -1;
  }

  function isVoigram() {
    return state.animationType.indexOf('voigram') > -1;
  }

  function setAnimationDuration(newCount) {
    var seconds = Number.parseFloat(newCount)
    if (Number.isNaN(seconds)) return;

    qs.set('d', seconds);
    state.duration = seconds;
    if (currentPixChart) {
      currentPixChart.setFramesCount(toFrames(seconds));
    }
  }

  function setBucketCount(newCount) {
    var bucketCount = Number.parseInt(newCount, 10);
    if (Number.isNaN(bucketCount) || bucketCount < 1) return;

    qs.set('bc', bucketCount);
    state.bucketCount = bucketCount;
    if (currentPixChart) {
      restartCurrentAnimation();
    }
  }

  function setMaxPixels(newCount) {
    var maxPixels = Number.parseInt(newCount, 10)
    if (Number.isNaN(maxPixels)) return;

    state.maxPixels = maxPixels;

    if (currentPixChart) {
      progressElement.style.innerText = 'Updating particles...';
      progressElement.style.opacity = '1';
      currentPixChart.setMaxPixels(maxPixels);
    }
  }

  function processPrevInQueue(forceDispose) {
    if (queue.length === 0) return;

    lastIndex -= 2;
    if (lastIndex < 0) lastIndex = queue.length - 1;
    processNextInQueue(forceDispose);
  }

  function processNextInQueue(forceDispose) {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = 0;
    }

    var img = queue[lastIndex]
    lastIndex += 1;
    if (lastIndex >= queue.length) lastIndex = 0;

    setImage(img, forceDispose)
  }
}

function toFrames(seconds) {
  return seconds * 60; // Assuming 60 fps.
}
