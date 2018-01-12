<template>
<div id='app'>
    <div v-if='!webGLEnabled'>
      <div class='absolute no-webgl'>
        <h4>WebGL is not enabled :(</h4>
        <p>This website needs <a href='https://en.wikipedia.org/wiki/WebGL' class='highlighted'>WebGL</a> to perform numerical integration.
        </p> <p>
        You can try another browser. If problem persists - very likely your video card isn't supported then.
      </p>
      </div>
    </div>
  <div class='settings-dialog' v-if='webGLEnabled'>
    <form class='input-row' @submit.prevent='onSubmit'>
      <input class='image-picker' type="text" placeholder="Paste image link here" v-model='scene.image'
        @focus='onInputFocused' @blur='inputSelected = false'>
      <a href="#" @click.prevent='onSubmit' class='submit'>Go</a>
    </form>
    <div class='file-picker'>
      or
        <input type="file" id="local-files-button" class="nodisplay" name="files[]" multiple="" accept="image/*" @change='onFilePickerChanged'>
        <label class='browse-btn' for="local-files-button">select a local file</label> 
    </div>
  </div>
  <div>

  </div>
  <a href='#' @click.prevent='aboutVisible = !aboutVisible' class='about-link'>about...</a>
  <about @close='aboutVisible = false' v-if='aboutVisible'></about>
</div>
</template>

<script>
import About from './components/About';

var sceneState = window.sceneState;

export default {
  name: 'app',
  components: {
    About
  },
  data() {
    return {
      webGLEnabled: window.webGLEnabled,
      scene: sceneState,
      inputSelected: false,
      aboutVisible: false
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
@import './shared.styl';

#app {
  position: absolute;
  width: 100%;
  height: 100%;
}

a {
  color: primary-text;
  text-decoration: none;
}
a.highlighted {
  color: white;
  border-bottom: 1px dashed white;
}
.nodisplay {
  display: none;
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
a.about-link {
  position: absolute;
  left: 7px;
  bottom: 26px;
}
.no-webgl {
  width: 100%;
  color: hsla(215, 37%, 55%, 1);
  flex-direction: column; text-align: center;
  padding: 12px;
}
.no-webgl h4 {
  margin: 7px 0;
  font-size: 24px;
}
.ui-container {
  position: absolute;
}
@media (max-width: small-screen) {
  a.about-link {
    bottom: 14px;
  }
  .settings-dialog {
    width: 100%;
  }
}
</style>
