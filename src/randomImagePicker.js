module.exports = randomImagePicker;

var predefinedLinks = require('./lib/predefinedImages');
var jsonp = require('./lib/jsonp');

function randomImagePicker() {
  var desktopPapers = ['wallpapers', 'EarthPorn'].join('+');
  var mobilePapers = 'iWallpaper'

  var storedLinks = predefinedLinks;
  var startFrom = Math.floor(Math.random() * storedLinks.length);
  var after;
  fetchNextPage();

  return {
    select: select
  }

  function select() {
    return new Promise(resolve => {
      var img = storedLinks[startFrom]
      startFrom += 1;
      if (startFrom >= storedLinks.length) {
        startFrom = 0;
        fetchNextPage();
      }
      resolve(img);
    });
  }

  function fetchNextPage() {
    var subreddits = window.innerWidth > window.innerHeight ? desktopPapers : mobilePapers;
    jsonp(getUrl(subreddits), {param: 'jsonp'}).then(storeResponse);
  }

  function getUrl(subredditName) {
    var link = `https://www.reddit.com/r/${subredditName}/top/.json?sort=top&t=week&limit=100`;
    if (after) {
      link += '&after=' + after;
    }
    return link;
  }

  function storeResponse(resp) {
    var children = resp && resp.data && resp.data.children;
    startFrom = 0;

    if (!children) {
      storedLinks = predefinedLinks;
      return;
    }
    after = resp.data.after;

    storedLinks = children.filter(x => {
      return x.data.domain === 'i.imgur.com' && x.data.thumbnail !== 'nsfw'
    }).map(x => x.data.url);
    shuffle(storedLinks);
  }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}