<template>
  <div>
    <div>Colors</div>
    <virtual-list :size="40" :remain="8">
      <a class='table-row' href="#" v-for='color in colors' @click.prevent='ignoreColor(color)'>
        <span>{{color.name.toFixed(3)}}</span>
        <span>{{format(color.count)}}</span>
      </a>
    </virtual-list>
  </div>
</template>
<script>
var sceneState = window.sceneState;
var virtualList = require('vue-virtual-scroll-list');
var formatNumber = require('../lib/formatNumber');
var bus = require('../bus');

export default {
  name: 'Statistics',
  components: { 'virtual-list': virtualList },

  beforeCreate() {
    bus.on('image-loaded', imageLoaded, this);
  },
  beforeDestroy() {
    bus.off('image-loaded', imageLoaded, this);
  },
  data() {
    return {
      colors: []
    }
  },
  methods: {
    format(x) { return formatNumber(x); },
    ignoreColor(color) { sceneState.ignoreColor(color.name); }
  }
}

function imageLoaded() {
  var stats = sceneState.getStatistics();
  this.colors = stats;
}
</script>

<style lang="stylus">
.table-row {
  display: flex;
  height: 40px;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
}

</style>