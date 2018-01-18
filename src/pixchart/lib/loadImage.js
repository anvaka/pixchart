module.exports = loadImage;

function loadImage(imageObject, options) {
  options = options || {};
  var resolveImage, rejectImage;
  var scaleImage = options.scaleImage;
  var maxPixels = options.maxPixels;

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
    
    if (!maxPixels) {
      // TODO: Not sure if this is bad or good.
      maxPixels = Math.min(window.innerWidth * window.innerHeight, 640 * 640);
    }

    var ar = image.width/image.height;
    var h0 = Math.sqrt(maxPixels * ar);
    var w0 = maxPixels / h0;
    if (h0 < image.height || w0 < image.width) {
      image.width = h0;
      image.height = w0;
    }
  }
}