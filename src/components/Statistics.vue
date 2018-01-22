<template>
  <div v-if='isVisible' class='statistic'>
    <h3 class='title'>Statistics</h3>
    <i v-if='!filtered' class='reset-filters' >Click on a list item below to filter.</i>
    <div class='reset-filters' v-if='filtered'>The image is filtered. <a href='#' @click.prevent='removeFilters'>Click here</a>
    to reset all filters.</div>
    <div class='header'>
      <a href='#' @click.prevent='sortBy("bucketNumber")' class='secondary-text' title='Click to sort by bucket'>
        <sort-indicator :is-descending='isDescending'  v-if='currentSort !== "count"'></sort-indicator>
        {{name}}
      </a>
      <a href='#' @click.prevent='sortBy("count")' class='secondary-text count' title='Click to sort by count'>
        <sort-indicator :is-descending='isDescending' v-if='currentSort === "count"'></sort-indicator>
        Count
      </a>
    </div>
    <virtual-list :size="40" :remain="8" ref='bucketListEl'>
      <a class='table-row' href="#" v-for='bucket in buckets' :key='bucket.id' @click.prevent='ignoreBucket(bucket, $event)' title='Click to toglle bucket visibilit' >
        <div class='visual-cue' :style='{width: bucket.ratio + "%"}' v-if='!bucket.isFiltered'></div>
        <div class='visual-strike' v-if='bucket.isFiltered'></div>
        <span>{{getBucketDisplayName(bucket.id)}}</span>
        <span>{{format(bucket.count)}}</span>
      </a>
    </virtual-list>
  </div>
</template>
<script>
import SortIndicator from './SortIndiciator';

var virtualList = require('vue-virtual-scroll-list');
var formatNumber = require('../lib/formatNumber');

var bus = require('../bus');
var sceneState = window.sceneState;

export default {
  name: 'Statistics',
  components: {
    'virtual-list': virtualList,
    SortIndicator
  },
  beforeCreate() {
    bus.on('image-loaded', imageLoaded, this);
    bus.on('image-unloaded', imageUnloaded, this);
  },
  beforeDestroy() {
    bus.off('image-loaded', imageLoaded, this);
    bus.off('image-unloaded', imageUnloaded, this);
  },
  data() {
    return {
      buckets: [],
      filtered: false,
      name: '',
      currentSort: 'count',
      isDescending: true,
      isVisible: false,
      multiplier: 1,
    }
  },
  methods: {
    getBucketDisplayName(bucketId) {
      return nice(bucketId, this.multiplier) + ' .. ' + nice(bucketId + this.step, this.multiplier);
    },
    sortBy(sorterName) {
      if (sorterName === this.currentSort) {
        this.isDescending = !this.isDescending;
      } else {
        this.isDescending = sorterName === 'count';
      }
      this.currentSort = sorterName;

      var sorter = makeSorter(sorterName, this.isDescending);
      this.buckets.sort(sorter);
      this.$refs.bucketListEl.setScrollTop(0);
    },
    removeFilters() {
      sceneState.ignoreBucket(null);
      this.$emit('filtered');
    },
    format(x) { return formatNumber(x); },
    ignoreBucket(bucket, e) { 
      if (e.shiftKey) {
        sceneState.ignoreBucket(
          this.buckets.filter(b => b.id !== bucket.id)
        );
      } else {
        sceneState.ignoreBucket(bucket); 
      }
      this.$emit('filtered');
    }
  }
}

function makeSorter(propName, isDescending) {
  return isDescending ? (y, x) => x[propName] - y[propName] : (x, y) => x[propName] - y[propName];
}

function nice(x, mul) {
  return 100 * Math.round(mul * x)/mul + '%';
}

function imageLoaded() {
  var stats = sceneState.getStatistics();
  this.filtered = stats.isFiltered;
  this.buckets = stats.buckets;
  this.name = stats.name;
  this.step = stats.step;
  this.currentSort = 'count';
  var exponent =  Math.floor(Math.abs(Math.log10(stats.step))) + 1;
  this.multiplier = Math.pow(10, exponent);
  this.isVisible = true;
  var bucketList = this.$refs.bucketListEl;
  if (bucketList) bucketList.setScrollTop(0);
}

function imageUnloaded() {
  this.isVisible = false;
  this.filtered = false;
}
</script>

<style lang="stylus">
.statistic {
  h3 {
    padding: 8px 7px;
  }
  .header {
    padding: 0px 7px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    display: flex;
    a {
      flex: 1;
      height: 32px;
      padding: 6px 0;
      font-size: 16px;
      &.count {
        text-align: right;
      }
    }
  }
}

.reset-filters {
  padding: 0 8px 16px;
  text-align: center;
}
i.reset-filters  {
  padding: 0;
  display: inline-block;
  width: 100%;
}

.table-row {
  padding: 0px 7px;
  position: relative;
  display: flex;
  height: 40px;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }
  span {
    align-self: center;
    z-index: 2;
  }
  .visual-cue {
    position: absolute;
    left: 0;
    top: 9%;
    height: 82%;
    background: rgba(0, 0, 0, 0.3);
  }
  .visual-strike {
    position: absolute;
    left: 0;
    width: 100%;
    top: 50%;
    height: 2px;
    border: 1px solid;
  }
}

</style>