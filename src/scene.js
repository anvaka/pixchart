var queryState = require('query-state');
var pixChart = require('./pixchart/index');

var qs = queryState({}, {useSearch: true});

// var appState = qs.get();

module.exports = initScene;

function initScene(canvas) {
  var currentPixChart;
  var progressElement = document.getElementById('progress');
  var url = qs.get('link')
  if (url) {
    progressElement.style.display = 'block';
    currentPixChart = pixChart(url, canvas);
    currentPixChart.on('load-progress', showLoadingProgress);
  }

  function showLoadingProgress(progress) {
    if (progress.step === 'pixels') {
      progressElement.innerText = 'Processed ' + progress.current + ' pixels out of ' + progress.total;
    } else if (progress.step === 'done') {
      progressElement.style.display = 'none';
    }
  }
}
