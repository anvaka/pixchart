<template>
  <div class='themes-container'>
    <a ref='toggleButton' href='#' class='current-theme' @click='toggleExpanded'><span class='sample secondary-border' :style='{"background-color": selected.color}'></span>{{selected.name}}</a>
    <div class='themes' ref='themes' :class='{collapsed: !expanded}' >
      <a href='#' v-for='theme in themes' @click.prevent='selectTheme(theme)' class='theme-picker' :style='{"background-color": theme.color}' :title='theme.name'>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorPicker',
  props:  ['themes', 'selected'],
  data() {
    return {
      expanded: false
    };
  },
  beforeDestroy() {
    this.stopMouseMonitor();
  },
  methods: {
    selectTheme(theme) {
      this.$emit('select', theme);
    },
    toggleExpanded() {
      if (!this.expanded) this.open();
      else this.close();
    },
    open() {
      this.expanded = true;
      this.startMouseMonitor();
    },
    close() {
      this.expanded = false;
      this.stopMouseMonitor();
    },
    startMouseMonitor() {
      this.mouseDownHandler = this.handleMouseDown.bind(this);
      document.addEventListener('mousedown', this.mouseDownHandler, true);
      document.addEventListener('touchstart', this.mouseDownHandler, true);

      this.closeHandler = (e) => {
        if (e.keyCode === 27) {
          e.preventDefault();
          this.close();
        }
      }
      document.addEventListener('keydown', this.closeHandler, true);
    },
    stopMouseMonitor() {
      document.removeEventListener('mousedown', this.mouseDownHandler, true);
      document.removeEventListener('touchstart', this.mouseDownHandler, true);
      document.removeEventListener('keydown', this.closeHandler, true);

    },
    handleMouseDown(e) {
      if (!this.expanded) {
        // weird. How did we get here?
        this.stopMouseMonitor();
        return;
      }

      if (this.$refs.toggleButton === e.target || this.$refs.themes.contains(e.target)) {
        // it's okay, we are clicking on a theme color
        return;
      }
      this.toggleExpanded();
    }
  }
}
</script>

<style lang='stylus'>
.themes-container {
  flex: 1;
  padding-left: 14px;
  height: 34px;
  align-items: stretch;
  .current-theme {
    height: 100%;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
.sample {
  display: inline-block
  width: 18px;
  height: 18px;
  margin-right: 8px;
  border: 1px solid;
}
.themes {
  width: 170px;
  flex-wrap: wrap;
  flex-direction: row;
  display: flex;
}
.themes.collapsed {
  display: none;
}
.theme-picker {
  width: 28px;
  height: 28px;
}
</style>
