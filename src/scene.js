var queryState = require('query-state');
var pixChart = require('./pixchart/index');

var qs = queryState({}, {useSearch: true});

module.exports = initScene;

function initScene(canvas) {
  var currentPixChart;
  var progressElement = document.getElementById('progress');
  var url = qs.get('link')
  if (url) setImage(url);
  
  var state = {
    image: url,
    qs,
    setImage
  }

  window.sceneState = state;

  function showLoadingProgress(progress) {
    if (progress.step === 'pixels') {
      progressElement.innerText = 'Processed ' + format(progress.current) + ' pixels out of ' + format(progress.total);
    } else if (progress.step === 'done') {
      progressElement.style.display = 'none';
      qs.set('link', progress.imageLink)
    }
  }

  function setImage(url) {
    if(currentPixChart) currentPixChart.dispose();

    progressElement.style.display = 'block';

    currentPixChart = pixChart(url, {
      canvas,
      scaleImage: false,
      progress: showLoadingProgress
    });
  }
}

function format(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}