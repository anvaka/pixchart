
module.exports = makeStats;

function makeStats(buckets) {
  var n = buckets.length;
  var sortedColors = [];
  for (var i = 0; i < n; ++i) {
    var count = buckets[i];
    if (count === 0) continue;
    sortedColors.push({
      name: i/n,
      count: buckets[i]
    });
  }

  sortedColors.sort((b, a) => {
    return a.count - b.count;
  });

  return sortedColors;
}