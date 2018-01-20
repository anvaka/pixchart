var {rgbToHsl} = require('./colors');

module.exports = {
  'rgb.r': function (r, g, b) { return r/255; },
  'rgb.g': function (r, g, b) { return g/255; },
  'rgb.b': function (r, g, b) { return b/255; },
  'hsl.h': function (r, g, b) { return rgbToHsl(r, g, b, 0); },
  'hsl.s': function (r, g, b) { return rgbToHsl(r, g, b, 1); },
  'hsl.l': function (r, g, b) { return rgbToHsl(r, g, b, 2); },
  'avg.rgb': function (r, g, b) { 
    return (r/255 + g/255 + b/255)/3;
  },
  'harmonic.rgb': {
    getValue(r, g, b) { 
      return 3/(1/r + 1/g + 1/b); 
    },
    normalize: true
  }
}