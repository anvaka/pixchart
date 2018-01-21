<template>
  <div class='timeline'>
    <div class='controls'>
    <a href='#' @click.prevent='togglePaused' class='toggle-pause'>
<svg v-if='!paused' version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 12 14">
<path d="M12 1.5v11q0 0.203-0.148 0.352t-0.352 0.148h-4q-0.203 0-0.352-0.148t-0.148-0.352v-11q0-0.203 0.148-0.352t0.352-0.148h4q0.203 0 0.352 0.148t0.148 0.352zM5 1.5v11q0 0.203-0.148 0.352t-0.352 0.148h-4q-0.203 0-0.352-0.148t-0.148-0.352v-11q0-0.203 0.148-0.352t0.352-0.148h4q0.203 0 0.352 0.148t0.148 0.352z"></path>
</svg>
<svg v-if='paused' version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 12 14">
<path d="M10.812 7.242l-10.375 5.766q-0.18 0.102-0.309 0.023t-0.129-0.281v-11.5q0-0.203 0.129-0.281t0.309 0.023l10.375 5.766q0.18 0.102 0.18 0.242t-0.18 0.242z"></path>
</svg>
    </a>
      <div class='slider'>
        <div class='line'></div>
        <a class='knob' href='#' ref='knob' :style='{left: left + "px"}'>
          <div class='knob-indicator'></div>
        </a>
      </div>
    </div>
  </div>
</template>
<script>
import createDrag from '../lib/drag.js';
import bus from '../bus';

function clamp(x, min, max) {
  return x < min ? min : x > max ? max : x;
}

export default {
  data() {
    return {
      paused: false,
      maxWidth: 400,
      left: 0
    };
  },
  mounted() {
    this.updateMaxWidth();
    this.resizer = createDrag(this.$refs.knob, dx => {
      var newLeft = clamp(this.left + dx, 0, this.maxWidth);
      this.left = newLeft
    }, () => this.updateMaxWidth());
    bus.on('animation-frame', this.onAnimationFrame, this);
    this.updateSize = this.updateMaxWidth.bind(this);
    window.addEventListener('resize', this.updateSize);
  },
  beforeDestroy() {
    this.resizer.dispose();
    bus.off('animation-frame', this.onAnimationFrame, this);
    window.removeEventListener('resize', this.updateSize);
  },
  methods: {
    updateMaxWidth() {
      this.maxWidth = this.$refs.knob.parentElement.clientWidth - 42;
    },
    togglePaused() {
      this.paused = !this.paused;
    },
    onAnimationFrame(t) {
      this.left = t * this.maxWidth;
    }
  }
}
</script>


<style lang="stylus">
@import '../shared.styl';

.timeline {
  position: absolute;
  bottom: 100px;
  margin-left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 42px;
  background: orange;
  .knob {
    position: absolute;
    width: 42px;
    top: 0;
    background: blue;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    .knob-indicator {
      background: red;
      border-radius: 8px;
      width: 16px;
      height: 16px;
    }
  }
  .controls {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    height: 100%;
    .toggle-pause {
      width: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    .slider {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      background: pink;
      .line {
        flex: 1;
        height: 4px;
        background-color: green;
        margin: 0 21px;
      }
    }
  }
}
@media (max-width: small-screen) {
  .timeline {
    width: 100%;
  }
}

</style>
