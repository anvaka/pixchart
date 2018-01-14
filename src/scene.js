var queryState = require('query-state');
var pixChart = require('./pixchart/index');
var config = require('./config.js');

var qs = queryState({}, {useSearch: true});

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
  
  window.addEventListener('resize', updateSize);

  var state = {
    image: url,
    sidebarOpen: true,
    qs,
    updateSize,
    setImages,
    dispose,
  }

  window.sceneState = state;

  function dispose() {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = 0;
    }
    window.removeEventListener('resize', updateSize);
    currentPixChart.dispose();
    currentPixChart = null;
  }

  function updateSize() {
    if (currentPixChart) {
      var sideBarWidth = (!state.sidebarOpen || config.isSmallScreen ()) ? 0: config.sidebarWidth;
      currentPixChart.setSceneSize(window.innerWidth - sideBarWidth, window.innerHeight);
    }
  }

  function showLoadingProgress(progress) {
    if (progress.step === 'pixels') {
      progressElement.innerText = 'Processed ' + format(progress.current) + ' pixels out of ' + format(progress.total);
    } else if (progress.step === 'done') {
      progressElement.style.display = 'none';
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
      currentPixChart.dispose();
    }

    progressElement.style.display = 'block';

    currentPixChart = pixChart(imageLink, {
      canvas,
      scaleImage: true,
      progress: showLoadingProgress,
      cycleComplete: () => {
        pendingTimeout = setTimeout(processNextInQueue, 1000);
      }
    });
  }

  function setImages(files) {
    if (files.length > 0) {
      // TODO: Queued images are not visible anywhere.
      //  Might need to improve UX around this area
      queue = files;
      lastIndex = 0;
      processNextInQueue();
    }
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