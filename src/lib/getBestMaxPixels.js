module.exports = getBestMaxPixels;

function getBestMaxPixels() {
  var dpr = Math.floor(window.devicePixelRatio);
  var windowArea = window.innerWidth * window.innerHeight;

  if (dpr === 1 && windowArea > 640 * 640) {
    dpr = 2; // Large screens tend to have faster CPUs
  }

  return Math.min(windowArea, 640 * 640) * dpr*0.9;
}