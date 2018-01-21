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
  <div class='settings-dialog darker-background' v-if='webGLEnabled' :class='{"collapsed": !scene.sidebarOpen}'>
    <div class='sidebar-buttons darker-background'>
      <a class='about-icon' href='#' @click.prevent='aboutVisible = !aboutVisible' title='click to learn more about this website'>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 12 14">
<path d="M6.875 9.375v1.25q0 0.109-0.070 0.18t-0.18 0.070h-1.25q-0.109 0-0.18-0.070t-0.070-0.18v-1.25q0-0.109 0.070-0.18t0.18-0.070h1.25q0.109 0 0.18 0.070t0.070 0.18zM8.875 5.5q0 0.391-0.117 0.703t-0.355 0.539-0.406 0.344-0.465 0.281q-0.25 0.141-0.363 0.219t-0.203 0.187-0.090 0.227v0.25q0 0.109-0.070 0.18t-0.18 0.070h-1.25q-0.109 0-0.18-0.070t-0.070-0.18v-0.531q0-0.273 0.082-0.504t0.187-0.371 0.305-0.277 0.32-0.199 0.348-0.164q0.414-0.195 0.586-0.336t0.172-0.383q0-0.328-0.34-0.559t-0.746-0.23q-0.438 0-0.742 0.211-0.227 0.156-0.625 0.648-0.070 0.094-0.195 0.094-0.086 0-0.148-0.047l-0.844-0.641q-0.078-0.055-0.094-0.156t0.039-0.18q0.953-1.5 2.727-1.5 1.008 0 1.863 0.699t0.855 1.676zM6 2q-1.016 0-1.941 0.398t-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941-0.398-1.941-1.066-1.594-1.594-1.066-1.941-0.398zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path>
</svg>

      </a>
      <a href='#' @click.prevent='selectRandomImage' class='try-random'>Try random image</a>
      <a href='#' @click.prevent='scene.sidebarOpen = !scene.sidebarOpen' class='toggle-sidebar'>{{scene.sidebarOpen ? 'Hide options' : 'Advanced'}}</a>
 <a href='#' @click.prevent='openShareDialog' class='share-btn' title='Share'>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 12 14">
<path d="M9.5 8q1.039 0 1.77 0.73t0.73 1.77-0.73 1.77-1.77 0.73-1.77-0.73-0.73-1.77q0-0.094 0.016-0.266l-2.812-1.406q-0.719 0.672-1.703 0.672-1.039 0-1.77-0.73t-0.73-1.77 0.73-1.77 1.77-0.73q0.984 0 1.703 0.672l2.812-1.406q-0.016-0.172-0.016-0.266 0-1.039 0.73-1.77t1.77-0.73 1.77 0.73 0.73 1.77-0.73 1.77-1.77 0.73q-0.984 0-1.703-0.672l-2.812 1.406q0.016 0.172 0.016 0.266t-0.016 0.266l2.812 1.406q0.719-0.672 1.703-0.672z"></path>
</svg>
</a>
    </div>

  <div class='sidebar-content darker-background'>
    <div class='group secondary-text'>
      <h3 class='title'>Image</h3>
      <div class='help-text secondary-color'>Paste image below or <label class='browse-btn primary-text' for="local-files-button">pick a file from your device</label></div>
      <form class='input-row' @submit.prevent='onSubmit' :class='{"focused": inputSelected}'>
        <input class='image-picker primmary-background' type="text" placeholder="Paste image here" 
          v-model='scene.image'
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          @focus='onInputFocused' @blur='inputSelected = false'>
        <a href="#" @click.prevent='onSubmit' class='submit'>Go</a>
      </form>
      <input type='file' id='local-files-button' class='nodisplay' name="files[]" multiple="" accept="image/*" @change='onFilePickerChanged'>
    </div>

    <div class='group secondary-text' :class='{"first-run": scene.isFirstRun}'>
      <h3 class='title'>Animation</h3>
      <div class='row'>
        <div class='col'>Initial state</div>
        <div class='col'>
          <select v-model='initialImageState' @change='changeInitialState'>
            <option value='expanded'>Image</option>
            <option value='collapsed'>Chart</option>
	        </select>
        </div>
      </div>
      <div class='row'>
        <div class='col'>Buckets count</div>
        <div class='col'><input type='number' step="any" min='0' @keyup.enter='closeForm' v-model='bucketCount' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
      </div>
      <div class='row'>
        <div class='col'>Duration (in seconds)</div>
        <div class='col'><input type='number' step="any" min='0' @keyup.enter='closeForm' v-model='duration' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
      </div>
      <div class='row'>
        <div class='col'>Max pixels count</div>
        <div class='col'><input type='number' step='100' min='2' @keyup.enter='closeForm' v-model='maxPixels' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
      </div>
      <div class='row'>
        <div class='col'>Group colors by</div>
        <div class='col'>
          <select v-model='possibleGroupBys.selected' @change='changeColor'>
            <option v-for='groupBy in possibleGroupBys.options' :value='groupBy.value'>{{groupBy.text}}</option>
	        </select>
        </div>
      </div>
      <div class='row color-row'>
        <div class="col">Background</div>
        <div class="col">
          <color-picker @select='selectTheme' :themes='themes' :selected='selectedTheme'></color-picker>
        </div>
      </div>
    </div>
    <!--div class='group secondary-text'>
      <h3 class='title'>Statistics</h3>
      <statistics></statistics>
    </div-->
  </div>
  <a class='hide-button' href='#' @click.prevent='scene.sidebarOpen = !scene.sidebarOpen'>
    <svg> <path d='M10,10 L5,5 L10,0z'></path> </svg>
  </a>
  </div>
  <about @close='aboutVisible = false' v-if='aboutVisible'></about>
  <share></share>
  <!--timeline></timeline-->
  <pause-monitor></pause-monitor>
</div>
</template>

<script>
import About from './components/About';
import Share from './components/Share';
import ColorPicker from './components/ColorPicker';
import Statistics from './components/Statistics';
import Timeline from './components/Timeline';
import PauseMonitor from './components/PauseMonitor';

import bus from './bus';
import createRandomImagePicker from './randomImagePicker';
import config from './config';
import createThemeManager from './lib/themeManager';

var sceneState = window.sceneState;
var themeManager = createThemeManager();
var randomImagePicker = createRandomImagePicker();

export default {
  name: 'app',
  components: {
    About,
    Share,
    ColorPicker,
    Statistics,
    Timeline,
    PauseMonitor
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
      bucketCount: sceneState.bucketCount,
      duration: sceneState.duration,
      maxPixels: sceneState.maxPixels,
      themes: themeManager.themes,
      selectedTheme: themeManager.getSelected(),
      initialImageState: sceneState.initialImageState,
      possibleGroupBys: {
        selected: sceneState.currentColorGroupBy,
        options: [{
          value: 'hsl.l',
          text: 'Lightness (HSL.L)'
        }, {
          value: 'hsl.h',
          text: 'Hue (HSL.H)'
        }, {
          value: 'hsl.s',
          text: 'Saturation (HSL.S)'
        }, {
          value: 'rgb.r',
          text: 'Red (RGB.R)'
        }, {
          value: 'rgb.g',
          text: 'Green (RGB.G)'
        }, {
          value: 'rgb.b',
          text: 'Blue (RGB.B)'
        }, {
          value: 'avg.rgb',
          text: 'Mean (RGB)'
        }]
      }
    }
  },
  watch: {
    'scene.sidebarOpen': function() {
      ensureBodyHasSidebarStyle()
      sceneState.updateSize();
    },
    duration(newValue) {
      sceneState.setAnimationDuration(newValue);
    },
    bucketCount(newValue) {
      sceneState.setBucketCount(newValue);
    },
    maxPixels(newValue) {
      clearTimeout(this.pendingPixelUpdate);
      this.pendingPixelUpdate = setTimeout(() => {
        sceneState.setMaxPixels(newValue)
      }, 300);
    }
  },

  methods: {
    closeForm() {
      hideIfNeeded();
    },
    onSubmit() {
      sceneState.setImages([this.scene.image]);
      hideIfNeeded();
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
      hideIfNeeded();
    },
    openShareDialog() {
      bus.fire('open-share-dialog');
    },
    selectRandomImage(e) {
      var selectMultiple = e.shiftKey;
      randomImagePicker.select(selectMultiple).then((imageUrl) => {
        sceneState.setImages(imageUrl);
      });
      hideIfNeeded();
    },
    selectTheme(theme) {
      themeManager.setTheme(theme.name);
      this.selectedTheme = themeManager.getSelected();
    },

    changeColor() {
      sceneState.setColorGroupBy(this.possibleGroupBys.selected);
      hideIfNeeded();
    },
    changeInitialState() {
      sceneState.setInitialState(this.initialImageState);
      hideIfNeeded();
    }
  }
}


function hideIfNeeded() {
  if (config.isSmallScreen()) sceneState.sidebarOpen = false;
}

function ensureBodyHasSidebarStyle() {
  if (!sceneState.sidebarOpen) document.body.classList.add('sidebar-closed')
  else document.body.classList.remove('sidebar-closed');
}
</script>

<style lang='stylus'>
@import './styles/app.styl';
@import './shared.styl';
a {
  text-decoration: none;
}
a.highlighted {
  border-bottom: 1px dashed;
}
.nodisplay {
  display: none;
}
h3.title {
  margin-top: 0px;
  margin-bottom: 7px;
  font-size: 21px;
  font-weight: normal;
}
.first-run {
  opacity: 0.2;
}
.group {
  padding: 8px 7px;
  .col {
    align-items: center;
    display: flex;
    flex: 1;
    select {
      margin-left: 14px;
    }
  }
  .row {
    margin-top: 4px;
    display: flex;
    flex-direction: row;
    height: 32px;
  }
  .color-row {
    height: auto;
    align-items: start;
    .col {
      min-height: 32px;
    }
  }
  input[type='text'],
  input[type='number'] {
    background: transparent;
    color: primary-text;
    border: 1px solid transparent;
    padding: 7px;
    font-size: 16px;
    width: 100%;
    margin-left: 7px;
    &:focus {
      outline-offset: 0;
      outline: none;
      border: 1px dashed;
    }
    &:invalid {
      box-shadow:none;
    }
  }
}

.sidebar-buttons a.toggle-sidebar {
  display: none;
}

.sidebar-content {
  top: 42px;
  font-size: 14px;
  padding-top: 8px;
  flex: 1;
  overflow-y: auto;
  width: 100%;
  transition: opacity;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.0,0.0,0.5,1);
}
.help-text {
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
  a {
    padding: 8px;
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
  }
  a.try-random {
    flex: 1;
  }
}
.hide-button {
  position: absolute;
  height: control-bar-height - 1;
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
a.share-btn {
  display: none;
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
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  .input-row {
    position: relative;
    display: flex;
    background: transparent;
    margin: 8px 0;
    caret-color: white;

    input.image-picker {
      height: 32px;
      width: 100%;
      padding: 7px;
      padding-right: 65px;
      outline: none;
      font-size: 14px;
      margin-left: 0;
    }

    a.submit {
      padding: 6px 12px;
      align-self: stretch;
      position: absolute;
      opacity: 0;
      right: 0;
      top: 0;
      transition: opacity 500ms;
    }
    &.focused {
      a.submit{
        opacity: 1
      }
    }
  }
  .file-picker {
    padding-top: 12px;
  }
  .browse-btn {
    cursor: pointer;
    font-weight: bold;
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

@media (min-width: small-screen + 1) {
  .settings-dialog.collapsed {
    transform: translateX(- settings-width);
  }
}

@media (max-width: small-screen) {
  a.about-link {
    bottom: 14px;
  }
  a.share-btn {
    flex: none;
    display: flex;
    width: 42px;
  }
  .settings-dialog {
    width: 100%;
    height: auto;
    max-height: 100%;
    overflow: hidden;
    .sidebar-buttons {
       a:last-child {
         border-right: none;
      }
      .toggle-sidebar {
        display: flex;
      }
    }
  }
  .settings-dialog.collapsed {
    .sidebar-content {
      //transform: translateY(-350px);
      display: none;
    }
  }
}
@media (max-width: 350px) {
  .sidebar-buttons {
    font-size: 12px;
  }
}
</style>
