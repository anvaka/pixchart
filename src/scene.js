var queryState = require('query-state');
var pixChart = require('./pixchart/index');

var qs = queryState({}, {useSearch: true});

// var appState = qs.get();

module.exports = initScene;

function initScene(canvas) {
  var currentPixChart;
  var url = qs.get('link')
  if (url) {
    currentPixChart = pixChart(url, canvas);
  }
}