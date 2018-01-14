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
  <div class='settings-dialog' v-if='webGLEnabled' :class='{"collapsed": !scene.sidebarOpen}'>
    <div class='file-picker'>
      <div class='image-buttons'>
        <a href='#' class='highlighted' @click.prevent='selectRandomImage'>try random image</a>
        <input type='file' id='local-files-button' class='nodisplay' name="files[]" multiple="" accept="image/*" @change='onFilePickerChanged'>
        <label class='browse-btn' for="local-files-button">try local files</label> 
      </div>
      <div class='center'>or</div>
    </div>
    <form class='input-row' @submit.prevent='onSubmit'>
      <input class='image-picker' type="text" placeholder="Paste image link here" v-model='scene.image'
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        @focus='onInputFocused' @blur='inputSelected = false'>
      <a href="#" @click.prevent='onSubmit' class='submit'>Go</a>
    </form>
    <a class='hide-button' href='#' @click.prevent='scene.sidebarOpen = !scene.sidebarOpen'>
      <svg> <path d='M10,10 L5,5 L10,0z' fill='white'></path> </svg>
    </a>
    <a href='#' @click.prevent='aboutVisible = !aboutVisible' class='about-link'>about...</a>
  </div>
  <about @close='aboutVisible = false' v-if='aboutVisible'></about>
</div>
</template>

<script>
import About from './components/About';
import createRandomImagePicker from './randomImagePicker';

var sceneState = window.sceneState;
var randomImagePicker = createRandomImagePicker();

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
      aboutVisible: false,
    }
  },
  watch: {
    'scene.sidebarOpen': function() {
      if (!sceneState.sidebarOpen) document.body.classList.add('sidebar-closed')
      else document.body.classList.remove('sidebar-closed');
      sceneState.updateSize();
    }
  },

  methods: {
    onSubmit() {
      sceneState.setImages([this.scene.image]);
    },
    onInputFocused(e) {
      e.target.select();
      this.inputSelected = true;
    },
    onFilePickerChanged(e) {
      var files = e.target.files;
      sceneState.setImages(files);
      // Try to reset the type
      e.target.type = 'input';
      e.target.type = 'file';
    },

    selectRandomImage() {
      randomImagePicker.select().then((imageUrl) => {
        sceneState.setImages([imageUrl]);
      })
    }
  }
}
</script>

<style lang='stylus'>
@import './shared.styl';

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
.hide-button {
  position: absolute;
  height: control-bar-height;
  right: -23px;
  width: 23px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  padding-left: 4px;
  svg {
    width: 12px;
    height: 12px;
  }
}
.sidebar-closed {
  .hide-button {
    padding-left: 8px;
    svg {
      transform: scaleX(-1);
    }
  }
}

.settings-dialog.collapsed {
  transform: translateX(- settings-width);
}

.settings-dialog {
  transition: transform;
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0.0,0.0,0.2,1);
  width: settings-width;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: #061838;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
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
.image-buttons {
  display: flex;
  justify-content: space-between;
}
.center {
    text-align: center;
    color: #658bbd;
    font-size: 17px;
    padding-bottom: 8px;
}
@media (max-width: small-screen) {
  a.about-link {
    bottom: 14px;
  }
  .settings-dialog {
    width: 100%;
    height: auto;
  }
}
</style>
