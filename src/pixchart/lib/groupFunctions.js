var {rgbToHsl} = require('./colors');

module.exports = {
  'rgb.r': {
    getValue(r, g, b) { return r/255; },
    name: 'Red'
  },
  'rgb.g': {
    getValue(r, g, b) { return g/255; },
    name: 'Green'
  },
  'rgb.b': {
    getValue(r, g, b) { return b/255; },
    name: 'Blue'
  },
  'hsl.h': {
    getValue(r, g, b) { return rgbToHsl(r, g, b, 0); },
    name: 'Hue'
  },
  'hsl.s': {
    getValue(r, g, b) { return rgbToHsl(r, g, b, 1); },
    name: 'Saturation',
  },
  'hsl.l': {
    getValue(r, g, b) { return rgbToHsl(r, g, b, 2); },
    name: 'Lightness'
  },
  'avg.rgb': {
    getValue(r, g, b) { 
      return (r/255 + g/255 + b/255)/3;
    },
    name: 'Average color'
  },
  'harmonic.rgb': {
    getValue(r, g, b) { 
      return 3/(1/r + 1/g + 1/b); 
    },
    normalize: true,
    name: 'Harmonic average'
  }
}