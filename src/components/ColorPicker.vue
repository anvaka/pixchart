<template>
  <div class='themes-container'>
    <a ref='toggleButton' href='#' class='current-theme' @click='toggleExpanded' title='Cick to toggle color theme picker'><span class='sample secondary-border' :style='{"background-color": selected.color}'></span>{{selected.name}}
    </a>
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
    },
    close() {
      this.expanded = false;
    },
  }
}
</script>

<style lang='stylus'>
.themes-container {
  flex: 1;
  padding-left: 14px;
  align-items: stretch;
  .current-theme {
    height: 32px;
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
  margin-top: 7px;
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
