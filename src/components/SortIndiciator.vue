<template>
  <div class='sort-indicator secondary-fill'>
<svg v-if='isDescending' version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="8" height="14" viewBox="0 0 8 14">
<path d="M8 8.5q0 0.203-0.148 0.352l-3.5 3.5q-0.148 0.148-0.352 0.148t-0.352-0.148l-3.5-3.5q-0.148-0.148-0.148-0.352t0.148-0.352 0.352-0.148h7q0.203 0 0.352 0.148t0.148 0.352z"></path>
</svg>
<svg v-if='!isDescending' version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="8" height="14" viewBox="0 0 8 14">
<path d="M8 5.5q0 0.203-0.148 0.352t-0.352 0.148h-7q-0.203 0-0.352-0.148t-0.148-0.352 0.148-0.352l3.5-3.5q0.148-0.148 0.352-0.148t0.352 0.148l3.5 3.5q0.148 0.148 0.148 0.352z"></path>
</svg>
  </div>
</template>

<script>
export default {
  name: 'SortIndicator',
  props: ['isDescending']
}
</script>

<style lang="stylus">
.sort-indicator {
  display: inline;
}

</style>
