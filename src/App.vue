<template>
<div id='app'>
    <div v-if='!webGLEnabled'>
      <div class='absolute no-webgl'>
        <h4>WebGL is not enabled :(</h4>
        <p>This website needs <a href='https://en.wikipedia.org/wiki/WebGL' class='highlighted'>WebGL</a> to perform numerical integration.
        </p> <p>
        You can try another browser. If problem persists - very likely your video card is not supported.
      </p>
      </div>
    </div>
  <div class='settings-dialog' v-if='webGLEnabled' :class='{"collapsed": !scene.sidebarOpen}'>
    <div class='sidebar-buttons'>
      <a class='about-icon' href='#' @click.prevent='aboutVisible = !aboutVisible' title='click to learn more about this website'>
        <svg width='22px' height='32px' viewBox="0 0 512 512">
  <path fill="#658bbd" d="M256 21C126.426 21 21 126.426 21 256s105.426 235 235 235 235-105.426 235-235S385.574 21 256 21zm0 36c110.118 0 199 88.882 199 199s-88.882 199-199 199S57 366.118 57 256 145.882 57 256 57zm-7.352 36.744c-8.227 0-15.317 2.976-21.27 8.928-5.776 5.952-8.665 12.955-8.665 21.008 0 8.227 2.89 15.23 8.666 21.006 5.95 5.776 13.04 8.666 21.268 8.666 8.228 0 15.23-2.89 21.006-8.666 5.777-5.777 8.666-12.78 8.666-21.006 0-8.053-2.976-15.056-8.927-21.008-5.777-5.952-12.692-8.928-20.745-8.928zm-62.757 82.453v28.096h46.215v186.13H185.89v27.833h140.22v-27.834h-45.69V176.197h-94.53z"/>
</svg>

      </a>
      <a href='#' @click.prevent='selectRandomImage'>try random image</a>
      <a href='#' @click.prevent='scene.sidebarOpen = !scene.sidebarOpen'>{{scene.sidebarOpen ? 'hide sidebar' : 'advanced'}}</a>
    </div>

  <div class='sidebar-content'>
    <div class='title'>Image picker</div>
      <div class='help-text'>Paste image link below</div>
      <form class='input-row' @submit.prevent='onSubmit'>
        <input class='image-picker' type="text" placeholder="Paste image link here" v-model='scene.image'
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          @focus='onInputFocused' @blur='inputSelected = false'>
        <a href="#" @click.prevent='onSubmit' class='submit'>Go</a>
      </form>
      <div class='help-text'>or <label class='browse-btn' for="local-files-button">pick a file</label> from your device</div>
          <input type='file' id='local-files-button' class='nodisplay' name="files[]" multiple="" accept="image/*" @change='onFilePickerChanged'>
    </div>

    <a class='hide-button' href='#' @click.prevent='scene.sidebarOpen = !scene.sidebarOpen'>
      <svg> <path d='M10,10 L5,5 L10,0z' fill='white'></path> </svg>
    </a>
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
  mounted() {
    ensureBodyHasSidebarStyle();
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
      ensureBodyHasSidebarStyle()
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

function ensureBodyHasSidebarStyle() {
  if (!sceneState.sidebarOpen) document.body.classList.add('sidebar-closed')
  else document.body.classList.remove('sidebar-closed');
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
.title {
  margin-bottom: 7px;
  color: primary-text;
  font-size: 18px;
}
.sidebar-content {
  padding: 7px;
  padding-top: 16px;
  padding-bottom: 16px;
  top: 42px;
  position: absolute;
  width: 100%;
  background: #061838;

  transition: top, opacity;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.0,0.0,0.5,1);
}
.help-text {
  color: help-text-color;
  font-size: 12px;
  font-style: italic;

}
a::selection, div::selection, h3::selection, h4::selection, p::selection, input::selection {
  background: #d03094;
  color: #fff;
}

.sidebar-buttons {
  display: flex;
  z-index: 2;
  flex-shrink: 0;
  height: control-bar-height;
  width: 100%;
  background-color: window-background;
  a {
    padding: 8px;
    display: flex;
    flex: 1;
    border-right: 1px solid secondary-text;
    border-bottom: 1px solid secondary-text;
    justify-content: center;
    align-items: center;
  }
}
.hide-button {
  position: absolute;
  height: control-bar-height;
  top: 0;
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
    visibility: visible;
    padding-left: 8px;
    svg {
      transform: scaleX(-1);
    }
  }
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
  .input-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    background: #182A4C;
    margin: 8px 0;
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
a.about-icon {
  flex: none;
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

@media (min-width: small-screen + 1) {
  .settings-dialog.collapsed {
    transform: translateX(- settings-width);
  }
}

@media (max-width: small-screen) {
  a.about-link {
    bottom: 14px;
  }
  .settings-dialog {
    width: 100%;
    height: auto;
    .sidebar-buttons {
       a:last-child {
         border-right: none;
      }
    }
  }
  .settings-dialog.collapsed {
    .sidebar-content {
      top: -250px;
    }
  }
}
</style>
