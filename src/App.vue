<template>
<div id='app'>
  <div class='settings-dialog'>
    <form class='input-row' @submit.prevent='onSubmit'>
      <input class='image-picker' type="text" placeholder="Paste image link here" v-model='scene.image'
        @focus='onInputFocused' @blur='inputSelected = false'>
      <a href="#" @click.prevent='onSubmit' class='submit'>Go</a>
    </form>
    <div class='file-picker'>
      or
        <input type="file" id="local-files-button" class="nodisplay" name="files[]" multiple="" accept=".jpg,.jpeg,.png,.apng,.tiff,.tif,.bmp" @change='onFilePickerChanged'>
        <label class='browse-btn' for="local-files-button">select a local file</label> 
    </div>
  </div>
</div>
</template>

<script>
var sceneState = window.sceneState;

export default {
  name: 'app',
  data() {
    return {
      scene: sceneState,
      inputSelected: false,
    }
  },
  methods: {
    onSubmit() {
      sceneState.setImage(this.scene.image);
    },
    onInputFocused(e) {
      e.target.select();
      this.inputSelected = true;
    },
    onFilePickerChanged(e) {
      sceneState.setLocalImages(e.target.files);
    }
  }
}
</script>

<style lang='stylus'>
#app {
  position: absolute;
}

.nodisplay {
  display: none;
}

a {
  text-decoration: none;
}
a::selection, div::selection, h3::selection, h4::selection, p::selection, input::selection {
  background: #d03094;
  color: #fff;
}
.settings-dialog {
  width: 395px;
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: #061838;
  box-shadow: 0 2px 4px rgba(0,0,0,.2);
  color: #eee;
  padding: 12px;
  .input-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    background: #182A4C;
    caret-color: white;
    ::placeholder{
      color: #658bbd;
    }

    a.submit {
      padding: 5px 12px;
      border-left: 1px solid #658bbd;
      align-self: stretch;
      color: #658bbd;
    }
  }
  .file-picker {
    padding-top: 12px;
    color: #ccc;
  }
  .browse-btn {
    border-bottom: 1px dashed white;
    color: white;
    cursor: pointer;
  }
  input.image-picker {
    height: 32px;
    width: 100%;
    background: #182A4C;
    border: none;
    padding: 7px;
    outline: none;
    font-size: 14px;
    color: #ccc;
  }
}
</style>
