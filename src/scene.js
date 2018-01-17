var queryState = require('query-state');
var pixChart = require('./pixchart/index');
var config = require('./config.js');
var createFileDropHandler = require('./lib/fileDrop');

var DEFAULT_ANIMATION_DURATION = 2.7; // in seconds, because visible to users
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

  window.addEventListener('paste', handlePaste, false);
  window.addEventListener('resize', updateSize);

  var dropHandler = createFileDropHandler(document.body, handleDroppedFiles);

  var state = {
    image: url,
    // We don't want to overwhelm people with options
    // when they are browsing from mobile.
    sidebarOpen: !config.isSmallScreen(),
    qs,
    duration: DEFAULT_ANIMATION_DURATION,

    updateSize,

    dispose,
    
    setImages,
    setAnimationDuration
  };

  setAnimationDuration(qs.get('d'));

  window.sceneState = state;
  return;

  function handlePaste(e){
    var items = e.clipboardData.items;
    var files = [];
    for(var i = 0; i < items.length; ++i) {
      var file = items[i];
      if (file.kind == "file") {
        files.push(file.getAsFile());
      }
    }
    if (files.length > 0) {
      e.preventDefault();
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

  function dispose() {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = 0;
    }
    window.removeEventListener('resize', updateSize);
    window.removeEventListener('paste', handlePaste, false);

    dropHandler.dispose();

    currentPixChart.dispose();
    currentPixChart = null;
  }

  function updateSize() {
    if (currentPixChart) {
      var sideBarWidthOffset = (!state.sidebarOpen || config.isSmallScreen ()) ? 0: config.sidebarWidth;
      var sideBarHeightOffset = config.isSmallScreen() ? config.sidebarHeight : 0;
      currentPixChart.setSceneSize(window.innerWidth - sideBarWidthOffset, window.innerHeight - sideBarHeightOffset);
    }
  }

  function showLoadingProgress(progress) {
    if (progress.step === 'pixels') {
      progressElement.innerText = 'Processed ' + format(progress.current) + ' pixels out of ' + format(progress.total);
    } else if (progress.step === 'done') {
      progressElement.style.opacity = '0';
      progressElement.innerText = 'Loading image...';
      if (progress.imageObject.isUrl) {
        // other objects cannot be shared
        qs.set('link', progress.imageObject.name)
        state.image = progress.imageObject.name;
      } else {
        qs.set('link', '')
      }
    } else if (progress.step === 'error') {
      progressElement.classList.add('error');
      cleanErrorClass = true;
      progressElement.innerHTML = 'Could not load image :(. <br /> Try uploading it to <a href="https://imgur.com" target="_blank">imgur.com</a>?'
      if (queue.length > 1) {
        pendingTimeout = setTimeout(processNextInQueue, 500);
      }
    } 

    if (cleanErrorClass && progress.step !== 'error') {
      // Just so that we are not doing this too often
      cleanErrorClass = false;
      progressElement.classList.remove('error');
    }
  }

  function setImage(imageLink) {
    if (currentPixChart && imageLink === currentPixChart.imageLink) {
      currentPixChart.restartCycle()
      return;
    }

    if (currentPixChart) {
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        pendingTimeout = 0;
      } 

      currentPixChart.dispose();
      pendingTimeout = setTimeout(() => {
        createPixChart(imageLink)
        pendingTimeout = 0;
      }, 250); // Give small time for fade animation to finish.
    } else {
      createPixChart(imageLink);
    }
  }

  function createPixChart(imageLink) {
    progressElement.innerText = 'Loading image...';
    progressElement.style.opacity = '1';

    currentPixChart = pixChart(imageLink, {
      canvas,
      scaleImage: true,
      framesCount: toFrames(state.duration),
      progress: showLoadingProgress,
      cycleComplete: () => {
        pendingTimeout = setTimeout(processNextInQueue, PAUSE_BETWEEN_CYCLES);
      }
    });
  }

  function setImages(files) {
    if (files.length === 0) return;
    // TODO: Queued images are not visible anywhere.
    //  Might need to improve UX around this area
    queue = files;
    lastIndex = 0;

    processNextInQueue();
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

  function toFrames(seconds) {
    return seconds * 60; // Assuming 60 fps.
  }

  function processNextInQueue() {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = 0;
    }

    var img = queue[lastIndex]
    lastIndex += 1;
    if (lastIndex >= queue.length) lastIndex = 0;

    setImage(img)
  }
}

function format(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// TODO: color themes.   background: #343945;