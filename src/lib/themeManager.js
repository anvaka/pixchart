var bus = require('../bus');
module.exports = createThemeManager;

var themes = [
  {
    "name": "zodiac",
    "color": "#13294F"
  },
  {
    "name": "bunting",
    "color": "#24354E"
  },
  {
    "name": "east-bay",
    "color": "#475770"
  },
  {
    "name": "carolina-blue",
    "color": "#9ABDDE"
  },
  {
    "name": "hippie-blue",
    "color": "#51A2A7"
  },
  {
    "name": "wood-bark",
    "color": "#312321"
  },
  {
    "name": "white",
    "color": "#ffffff"
  },
  {
    "name": "white-lilac",
    "color": "#E7E7E7"
  },
  {
    "name": "dark-gray",
    "color": "#a8a8a8"
  },
  {
    "name": "charcoal",
    "color": "#404040"
  },
  {
    "name": "black20",
    "color": "#212121"
  },
  {
    "name": "black",
    "color": "#000000"
  },
  {
    "name": "casablanka",
    "color": "#F2AD52"
  },
  {
    "name": "pink",
    "color": "#E99E9B"
  },
  {
    "name": "flamingo",
    "color": "#EC694D"
  },
  {
    "name": "maroon",
    "color": "#BF3558"
  },
  {
    "name": "rose-ebony",
    "color": "#664948"
  },
  {
    "name": "espresso",
    "color": "#642B1C"
  },
];



function createThemeManager() {
    var themeLookup = new Set();
    themes.forEach(x => themeLookup.add(x.name));

    return {
      themes,
      setTheme
    }

    function setTheme(themeName) {
      if (!themeLookup.has(themeName)) throw new Error('Unknown theme name ' + themeName)
      removeCurrentTheme();
      document.body.classList.add(themeName);
      bus.fire('theme-changed', themeName);
    }

    function removeCurrentTheme() {
      var classList = document.body.classList;
      for (var i = 0; i < classList.length; ++i) {
        var className = classList[i];
        if (themeLookup.has(className)) {
          classList.remove(className);
          return;
        }
      }
    }
}

// Use for whitelisting in index.html
function printDefaultThemes(themes) {
  var css = [];
  var themeNames = [];
  themes.forEach(x => {
    css.push('.' + x.name + ' { background: ' + x.color + '}');
    themeNames.push(x.name);
  })
  console.log(css.join('\n'))
  console.log(JSON.stringify(themeNames))
}