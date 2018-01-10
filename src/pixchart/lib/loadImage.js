module.exports = loadImage;

function loadImage(url, scaleImage) {
  var resolveImage, rejectImage;

  var image = new Image();
  image.crossOrigin = '';

  image.onload = imageLoaded;
  image.onerror = reportError;
  image.src = url;

  return new Promise((resolve, reject) => {
    resolveImage = resolve;
    rejectImage = reject; 
  });

  function reportError(err) { rejectImage(err); }
  
  function imageLoaded() {
    if (scaleImage) scale(image);
    resolveImage(image);
  }

  function scale(image) {
    // scaling image may change/distort colors.
    // todo: remove dependency on window?
    var sx = window.innerWidth/image.width;
    var sy = window.innerHeight/image.height;
    if (sx < sy) {
      image.width *= Math.min(sx, 2);
      image.height *= Math.min(sx, 2);
    } else {
      image.width *= Math.min(sy, 2);
      image.height *= Math.min(sy, 2);
    }
  }
}