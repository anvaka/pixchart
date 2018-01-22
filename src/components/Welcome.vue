<template>
  <div class='welcome'>
    <h3 class='title'>Welcome!</h3>
    <div class='primary-text help'>
      To see what this website does, click
    </div>
    <a href='#' @click.prevent='tryImage'>"try random image"</a> 
  </div>
</template>
<script>
export default {
  methods: {
    tryImage(e) {
      this.$emit('try', e);
    }
  }
}
</script>
<style lang="stylus">
@import '../shared';
.welcome {
  display: flex;
  justify-content: center;
  align-items: center;
  left: 400px;
  right: 0;
  height: 100%;
  position: absolute;
  flex-direction: column;
  .help {
    max-width 350px;
    text-align: center;
  }
}
.sidebar-closed .welcome {
  left: 0;
}
.welcome a {
  border-bottom: 1px dashed;
}

@media (max-width: small-screen) {
  .welcome {
    left: 0;
  }
}
</style>


