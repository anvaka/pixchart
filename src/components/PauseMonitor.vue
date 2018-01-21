<template>
  <div class='pause-monitor' :style='{left: x, top: y}'>
<svg v-if='paused' version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 14">
<path d="M12 1.5v11q0 0.203-0.148 0.352t-0.352 0.148h-4q-0.203 0-0.352-0.148t-0.148-0.352v-11q0-0.203 0.148-0.352t0.352-0.148h4q0.203 0 0.352 0.148t0.148 0.352zM5 1.5v11q0 0.203-0.148 0.352t-0.352 0.148h-4q-0.203 0-0.352-0.148t-0.148-0.352v-11q0-0.203 0.148-0.352t0.352-0.148h4q0.203 0 0.352 0.148t0.148 0.352z"></path>
</svg>
<svg v-if='!paused' version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 14"  class='resume'>
<path d="M10.812 7.242l-10.375 5.766q-0.18 0.102-0.309 0.023t-0.129-0.281v-11.5q0-0.203 0.129-0.281t0.309 0.023l10.375 5.766q0.18 0.102 0.18 0.242t-0.18 0.242z"></path>
</svg>
  </div>
</template>
<script>
var bus = require('../bus');

export default {
  name: 'PauseMonitor',
  mounted() {
    bus.on('pause-changed', this.onPauseChanged, this);
  },
  beforeDestroy() {
    bus.off('pause-changed', this.onPauseChanged, this);
  },
  data() {
    return {
      paused: false,
      x: 0,
      y: 0
    };
  },
  methods: {
    onPauseChanged(isPaused, coordinates) {
      this.paused = isPaused;
      this.x = (coordinates.x - 24) + 'px';
      this.y = (coordinates.y - 24) + 'px';
      if (this.pendingClear) {
        this.$el.classList.remove('playing');
        clearTimeout(this.pendingClear);
        this.pendingClear = 0;
      }

      this.$el.classList.add('playing');
      this.pendingClear = setTimeout(() => {
        this.$el.classList.remove('playing');
        this.pendingClear = 0;
      }, 600)
    }
  }
}
</script>

<style lang="stylus">
.pause-monitor{
  pointer-events: none;
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: rgba(0, 0, 0, 0.00);
  transition: transform, background-color;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    fill: rgba(255, 255, 255, 0.0);
    width: 12px;
    height: 12px;
  }
}

.playing {
  animation: 560ms pulse-play;
  svg {
    animation: 560ms fade-svg;
  }
  svg.resume {
    margin-left: 3px;
  }
}

@keyframes fade-svg {
  0% {
    fill: rgba(255, 255, 255, 1.0);
  }
  88% {
    fill: rgba(255, 255, 255, 0.7);
  }

  100% {
    fill: rgba(255, 255, 255, 0.0);
  }
}

@keyframes pulse-play {
  0% {
    background-color: rgba(0, 0, 0, 0.75);
    transform: scale(1.0);
  }

  88% {
    transform: scale(1.65);
  }

  100% {
    background-color: rgba(0, 0, 0, 0.00);
    transform: scale(1.7);
  }
}
</style>

