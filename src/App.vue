<template>
<div id='app'>
  <div class='settings-dialog'>
    <form class='input-row' @submit.prevent='onSubmit'>
      <input class='image-picker' type="text" placeholder="Paste image link here" v-model='imageLink'>
      <a href="#" @click.prevent='onSubmit' class='submit'>Go</a>
    </form>
  </div>
</div>
</template>

<script>
var sceneState = window.sceneState;

export default {
  name: 'app',
  data() {
    return {
      imageLink: sceneState.image
    }
  },
  methods: {
    onSubmit() {
      sceneState.setImage(this.imageLink);
    }
  }
}
</script>

<style lang='stylus'>
#app {
  position: absolute;
}

a {
  text-decoration: none;
}
.settings-dialog {
  width: 340px;
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 12px;
  top: 12px;
  .input-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    background: white;
    a.submit {
      padding: 5px 12px;
      border-left: 1px solid #ccc;
      align-self: stretch;
    }
  }
  input.image-picker {
    height: 32px;
    width: 100%;
    border: none;
    padding: 7px;
    outline: none;
    font-size: 14px;
  }
}
</style>
