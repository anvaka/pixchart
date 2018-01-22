
module.exports = makeStats;

function makeStats(particles) {
  var buckets = particles.buckets;
  var n = buckets.length;
  var sortedBuckets = [];
  var ignoredBuckets = particles.ignoredBuckets;

  for (var i = 0; i < n; ++i) {
    var count = buckets[i];
    if (count === 0) continue;
    var isFiltered = ignoredBuckets && ignoredBuckets.has(i);

    sortedBuckets.push({
      bucketNumber: i,
      id: i/n,
      count: isFiltered ? 0 : buckets[i],
      isFiltered,
      ratio: 100 * buckets[i]/(particles.maxYValue * particles.bucketWidth)
    });
  }

  sortedBuckets.sort((b, a) => {
    return a.count - b.count;
  });

  return {
    step: 1/n,
    isFiltered: ignoredBuckets && ignoredBuckets.size > 0,
    buckets: sortedBuckets,
    name: particles.groupByFunctionName + ' bucket '
  }
}