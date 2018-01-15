var vertexShader = require('./shaders/histogram.vs.glsl');

var fragmentShader = `
  precision highp float;
  varying vec4 v_color;

  void main() {
      gl_FragColor = v_color;
  }`;

module.exports = createShaders;

function createShaders() {
  return {
    fragmentShader,
    vertexShader
  }
}