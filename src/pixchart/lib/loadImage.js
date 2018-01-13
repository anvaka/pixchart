module.exports = loadImage;

function loadImage(imageObject, scaleImage) {
  var resolveImage, rejectImage;

  var image = new Image();
  image.crossOrigin = '';

  image.onload = imageLoaded;
  image.onerror = reportError;
  image.src = imageObject.getUrl();

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
    if (window.innerWidth < 400 || window.innerHeight < 400 && window.devicePixelRatio > 1) {
      sx *= window.devicePixelRatio;
      sy *= window.devicePixelRatio;
    }
    if (sx < sy) {
      image.width *= Math.min(sx, 2);
      image.height *= Math.min(sx, 2);
    } else {
      image.width *= Math.min(sy, 2);
      image.height *= Math.min(sy, 2);
    }

    var maxPixels = 500000;
    var ar = image.width/image.height;
    var h0 = Math.sqrt(maxPixels * ar);
    var w0 = maxPixels / h0;
    if (h0 < image.height || w0 < image.width) {
      image.width = h0;
      image.height = w0;
    }
  }
}